import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getStoragePath } from '@/lib/server/paths';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const filePath = `/${resolvedParams.path.join('/')}`;
        const publicPath = `/uploads${filePath}`;
        
        // Convert to storage path
        const storagePath = getStoragePath(publicPath);
        
        // Check if file exists
        try {
            await fs.access(storagePath);
        } catch {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read file
        const fileBuffer = await fs.readFile(storagePath);
        
        // Get file extension to determine content type
        const ext = path.extname(storagePath).toLowerCase();
        const contentTypeMap: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
        };
        
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        
        return new NextResponse(fileBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            },
        });
        
    } catch (error) {
        console.error('Error serving upload file:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}