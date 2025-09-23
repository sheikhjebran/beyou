import { executeQuery } from '@/lib/server/mysql';
import { User } from '../authService';

export async function verifyUser(userId: string): Promise<User> {
    try {
        const [users] = await executeQuery<any[]>(
            'SELECT id, email, display_name, photo_url, role, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );

        if (!users || (users as any[]).length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        return {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            profile_image_path: user.photo_url,
            role: user.role || 'user',
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error verifying user:', error);
        throw new Error('Failed to verify user');
    }
}
