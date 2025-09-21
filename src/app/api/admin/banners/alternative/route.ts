import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';

// Alternative upload method using query parameters (for small files)
async function POSTHandler(request: NextRequest) {
    try {
        console.log('Alternative upload method called');
        
        const url = new URL(request.url);
        const method = url.searchParams.get('method');
        
        if (method === 'url_upload') {
            // Method 1: Upload via URL parameters (for small files)
            const base64Data = url.searchParams.get('data');
            const filename = url.searchParams.get('filename') || 'upload.jpg';
            const title = url.searchParams.get('title') || '';
            const subtitle = url.searchParams.get('subtitle') || '';
            
            console.log('URL upload method:', { 
                hasData: !!base64Data, 
                dataLength: base64Data?.length || 0,
                filename, 
                title, 
                subtitle 
            });
            
            if (!base64Data) {
                return NextResponse.json(
                    { message: 'No data provided in URL' },
                    { status: 400 }
                );
            }
            
            try {
                const buffer = Buffer.from(base64Data, 'base64');
                console.log('Decoded buffer size:', buffer.length);
                
                const banner = await bannerService.addBanner({
                    imageBuffer: buffer,
                    originalFilename: filename,
                    title,
                    subtitle,
                });

                console.log('Banner uploaded via URL method:', banner.id);
                return NextResponse.json(banner);
                
            } catch (decodeError) {
                console.error('Base64 decode error:', decodeError);
                return NextResponse.json(
                    { message: 'Invalid base64 data', error: decodeError instanceof Error ? decodeError.message : 'Unknown error' },
                    { status: 400 }
                );
            }
        }
        
        // Method 2: Try to read from request body (fallback)
        console.log('Trying request body method...');
        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let bodyData;
        try {
            if (contentType?.includes('application/json')) {
                bodyData = await request.json();
            } else {
                const arrayBuffer = await request.arrayBuffer();
                bodyData = Buffer.from(arrayBuffer);
            }
            
            console.log('Body data received:', {
                type: typeof bodyData,
                size: bodyData instanceof Buffer ? bodyData.length : JSON.stringify(bodyData).length
            });
            
            if (bodyData instanceof Buffer && bodyData.length > 0) {
                const filename = request.headers.get('x-filename') || 'upload.jpg';
                const title = request.headers.get('x-title') || '';
                const subtitle = request.headers.get('x-subtitle') || '';
                
                const banner = await bannerService.addBanner({
                    imageBuffer: bodyData,
                    originalFilename: filename,
                    title,
                    subtitle,
                });

                return NextResponse.json(banner);
            }
            
            if (bodyData && typeof bodyData === 'object' && bodyData.imageFile) {
                const buffer = Buffer.from(bodyData.imageFile.data, 'base64');
                
                const banner = await bannerService.addBanner({
                    imageBuffer: buffer,
                    originalFilename: bodyData.imageFile.name,
                    title: bodyData.title,
                    subtitle: bodyData.subtitle,
                });

                return NextResponse.json(banner);
            }
            
        } catch (bodyError) {
            console.error('Body parsing error:', bodyError);
        }
        
        return NextResponse.json(
            { message: 'No valid data received via any method' },
            { status: 400 }
        );
        
    } catch (error) {
        console.error('Error in alternative upload:', error);
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

export const GET = async (request: NextRequest) => {
    return withAdminAuth(request, POSTHandler);
};