import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';

// Simple file upload endpoint that accepts raw binary data
async function POSTHandler(request: NextRequest) {
    try {
        console.log('Simple upload endpoint called');
        
        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        const filename = request.headers.get('x-filename') || 'upload.jpg';
        const title = request.headers.get('x-title') || '';
        const subtitle = request.headers.get('x-subtitle') || '';
        
        console.log('Upload headers:', { filename, title, subtitle });
        
        // Read the raw binary data
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log('Received file data, size:', buffer.length);
        
        if (buffer.length === 0) {
            return NextResponse.json(
                { message: 'No file data received' },
                { status: 400 }
            );
        }
        
        // Upload the banner
        const banner = await bannerService.addBanner({
            imageBuffer: buffer,
            originalFilename: filename,
            title,
            subtitle,
        });

        console.log('Banner uploaded successfully:', banner.id);
        return NextResponse.json(banner);
        
    } catch (error) {
        console.error('Error in simple upload:', error);
        return NextResponse.json(
            { 
                message: 'Error uploading banner', 
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Export with admin authentication
export const POST = async (request: NextRequest) => {
    return withAdminAuth(request, POSTHandler);
};