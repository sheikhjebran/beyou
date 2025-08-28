import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function getTokenCookie(request: NextRequest): Promise<string | null> {
    try {
        const token = request.cookies.get('token');
        return token?.value || null;
    } catch (error) {
        console.error('Error getting token cookie:', error);
        return null;
    }
}
