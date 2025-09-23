import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { verifyAuth } from '@/lib/server/auth';

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { displayName } = await request.json();
        if (!displayName) {
            return NextResponse.json({ message: 'Display name is required' }, { status: 400 });
        }

        // Update the user's display name
        await executeQuery(
            'UPDATE users SET display_name = ? WHERE id = ?',
            [displayName, user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating display name:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
