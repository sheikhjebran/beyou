import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { verifyAuth } from '@/lib/server/auth';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Both current and new passwords are required' }, { status: 400 });
        }

        // Get current password hash
        const [userData] = await executeQuery<any[]>(
            'SELECT password FROM users WHERE id = ?',
            [user.id]
        );

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await executeQuery(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
