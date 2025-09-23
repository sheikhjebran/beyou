import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

export async function middleware(request: NextRequest) {
    // Only handle requests for uploads
    if (!request.nextUrl.pathname.startsWith('/uploads/')) {
        return NextResponse.next();
    }

    try {
        // Get the file path relative to the public directory
        const filePath = path.join(process.cwd(), 'public', request.nextUrl.pathname);

        // Check if file exists
        if (!existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        // Let Next.js handle the file serving
        return NextResponse.next();
    } catch (error) {
        console.error('Error serving image:', error);
        return NextResponse.json(
            { error: 'Error serving image' },
            { status: 500 }
        );
    }
}

export const config = {
    matcher: '/uploads/:path*'
};