import { NextRequest } from 'next/server';
import { getTokenCookie } from '@/lib/server/cookie';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/server/mysql';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
    id: string;
    email: string;
    role: string;
    type: string;
}

export async function verifyAdminAuth(request: NextRequest) {
    try {
        const token = await getTokenCookie(request);
        if (!token) {
            console.log('No token found');
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        console.log('Token decoded:', { id: decoded.id, email: decoded.email, type: decoded.type });
        
        // Verify this is an admin token
        if (decoded.type !== 'admin') {
            console.log('Token is not an admin token');
            return null;
        }
        
        // Check if admin user exists in admin_users table
        const [admin] = await executeQuery<any[]>(
            'SELECT id, email, role FROM admin_users WHERE id = ? AND role = ?',
            [decoded.id, 'admin']
        );

        if (!admin) {
            console.log('Admin not found with id:', decoded.id);
            return null;
        }

        console.log('Admin verified:', admin.email);
        return admin;
    } catch (error) {
        console.error('Admin auth verification error:', error);
        return null;
    }
}