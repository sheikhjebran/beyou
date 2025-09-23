import { NextRequest } from 'next/server';
import { getTokenCookie } from '@/lib/server/cookie';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/server/mysql';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export async function verifyAuth(request: NextRequest) {
    try {
        const token = await getTokenCookie(request);
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        // Check if user exists and is active
        const [user] = await executeQuery<any[]>(
            'SELECT id, email, role, display_name FROM users WHERE id = ? AND is_active = TRUE',
            [decoded.userId]
        );

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}
