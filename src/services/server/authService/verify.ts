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
