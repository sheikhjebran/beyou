import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool, { executeQuery } from '@/lib/server/mysql';
import { uploadImage, deleteImage } from '@/lib/imageStorage';

// Verify user function
export async function verifyUser(userId: string): Promise<User> {
    try {
        // First try to find in admin_users table
        const [admins] = await executeQuery<any[]>(
            'SELECT id, email, role FROM admin_users WHERE id = ?',
            [userId]
        );

        if (admins && admins.length > 0) {
            const admin = admins[0];
            return {
                id: admin.id,
                email: admin.email,
                display_name: 'Admin',
                profile_image_path: null,
                role: admin.role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }

        // If not an admin, check regular users
        const [users] = await executeQuery<any[]>(
            'SELECT id, email, display_name, profile_image_path, role, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );

        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        return {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            profile_image_path: user.profile_image_path,
            role: user.role,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString()
        };
    } catch (error) {
        console.error('Error verifying user:', error);
        throw new Error('Failed to verify user');
    }
}

// Import database types
import { DbUser } from '@/types/database';

// Define user interface
export interface User {
    id: string;               // varchar(36)
    email: string;           // varchar(255)
    display_name: string | null;  // Using exact DB field name
    profile_image_path: string | null;  // Using exact DB field name
    role: 'admin' | 'user';  // enum('admin', 'user')
    created_at: string;     // timestamp
    updated_at: string;     // timestamp
}

// Sign Up with Email and Password
export async function signUpWithEmailPassword(email: string, password: string): Promise<User> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if user already exists
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if ((existingUsers as any[]).length > 0) {
            throw new Error("An account with this email already exists.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with UUID
        const userId = uuidv4();
        await connection.query(
            `INSERT INTO users (id, email, password_hash, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [userId, email, hashedPassword, 'user']
        );

        await connection.commit();

        return {
            id: userId,
            email,
            display_name: null,
            profile_image_path: null,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    } catch (error) {
        await connection.rollback();
        console.error("Error signing up:", error);
        throw new Error("Failed to sign up. Please try again.");
    } finally {
        connection.release();
    }
}

// Sign In with Email and Password
export async function signInWithEmailPassword(email: string, password: string): Promise<User> {
    const connection = await pool.getConnection();
    try {
        // Get user
        const [users] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if ((users as any[]).length === 0) {
            throw new Error("Invalid email or password.");
        }

        const user = (users as any[])[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error("Invalid email or password.");
        }

        return {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            profile_image_path: user.profile_image_path,
            role: user.role,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString()
        };
    } catch (error) {
        console.warn("Sign-in attempt failed:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to sign in.");
    } finally {
        connection.release();
    }
}

export async function updateUserProfile(userId: string, data: { display_name?: string, photo_file?: File }): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const updateFields = [];
        const updateValues = [];

        if (data.display_name !== undefined) {
            updateFields.push('display_name = ?');
            updateValues.push(data.display_name);
        }

        if (data.photo_file) {
            // Get current photo URL to delete old image
            const [users] = await connection.query(
                'SELECT profile_image_path FROM users WHERE id = ?',
                [userId]
            );
            
            const user = (users as any[])[0];
            if (user?.profile_image_path) {
                await deleteImage(user.profile_image_path);
            }

            // Upload new image
            const uploadedImage = await uploadImage(data.photo_file, `users/${userId}`);
            updateFields.push('profile_image_path = ?');
            updateValues.push(uploadedImage.path);
        }

        if (updateFields.length > 0) {
            // Add updated_at timestamp
            updateFields.push('updated_at = NOW()');
            
            updateValues.push(userId);
            await connection.query(
                `UPDATE users 
                 SET ${updateFields.join(', ')}
                 WHERE id = ?`,
                updateValues
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update profile.");
    } finally {
        connection.release();
    }
}

export async function getUserById(userId: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if ((users as any[]).length === 0) {
            return null;
        }

        const user = (users as any[])[0];
        return {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            profile_image_path: user.profile_image_path,
            role: user.role,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString()
        };
    } catch (error) {
        console.warn("Error fetching user:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<void> {
    const connection = await pool.getConnection();
    try {
        // Get current user
        const [users] = await connection.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if ((users as any[]).length === 0) {
            throw new Error("User not found.");
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, (users as any[])[0].password_hash);
        if (!isValid) {
            throw new Error("Current password is incorrect.");
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await connection.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
        );
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    } finally {
        connection.release();
    }
}
