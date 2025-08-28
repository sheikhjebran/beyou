import bcrypt from 'bcryptjs';
import pool, { executeQuery } from '@/lib/server/mysql';
import { uploadImage, deleteImage } from '@/lib/imageStorage';

// Verify user function
export async function verifyUser(userId: string): Promise<User> {
    try {
        const [users] = await executeQuery<any[]>(
            'SELECT id, email, display_name, photo_url FROM users WHERE id = ?',
            [userId]
        );

        if (!users || (users as any[]).length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        return {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            photoURL: user.photo_url
        };
    } catch (error) {
        console.error('Error verifying user:', error);
        throw new Error('Failed to verify user');
    }
}

// Define user interface
export interface User {
    id: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    token?: string;
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

        // Create user
        const [result] = await connection.query(
            `INSERT INTO users (email, password_hash) 
             VALUES (?, ?)`,
            [email, hashedPassword]
        );

        const userId = (result as any).insertId;

        await connection.commit();

        return {
            id: userId,
            email,
            displayName: null,
            photoURL: null
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
            displayName: user.display_name,
            photoURL: user.photo_url
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

export async function updateUserProfile(userId: string, data: { displayName?: string, photoFile?: File }): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const updateFields = [];
        const updateValues = [];

        if (data.displayName !== undefined) {
            updateFields.push('display_name = ?');
            updateValues.push(data.displayName);
        }

        if (data.photoFile) {
            // Get current photo URL to delete old image
            const [users] = await connection.query(
                'SELECT photo_url FROM users WHERE id = ?',
                [userId]
            );
            
            const user = (users as any[])[0];
            if (user?.photo_url) {
                await deleteImage(user.photo_url);
            }

            // Upload new image
            const uploadedImage = await uploadImage(data.photoFile, `users/${userId}`);
            updateFields.push('photo_url = ?');
            updateValues.push(uploadedImage.path);
        }

        if (updateFields.length > 0) {
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
            displayName: user.display_name,
            photoURL: user.photo_url
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
