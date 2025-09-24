import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';

// GET /api/admin/banners - Get all banners
async function GETHandler(request: NextRequest) {
    try {
        const banners = await bannerService.getBanners();
        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error getting banners:', error);
        return NextResponse.json(
            { message: 'Error fetching banners' },
            { status: 500 }
        );
    }
}

// Simplified POSTHandler using Next.js built-in FormData with better error handling
async function POSTHandler(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');
        console.log('Request content-type:', contentType);

        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.error('Invalid content-type:', contentType);
            return NextResponse.json(
                { message: 'Invalid content-type. Expected multipart/form-data.' },
                { status: 400 }
            );
        }

        console.log('Processing FormData request...');
        
        let formData;
        try {
            formData = await request.formData();
            console.log('FormData parsed successfully');
            console.log('FormData keys:', Array.from(formData.keys()));
        } catch (formDataError) {
            console.error('Failed to parse FormData:', formDataError);
            
            // Try to get more details about the error
            const errorDetails = formDataError instanceof Error ? formDataError.message : String(formDataError);
            console.error('FormData error details:', errorDetails);
            
            return NextResponse.json(
                { 
                    message: 'Failed to parse FormData', 
                    error: errorDetails,
                    debug: {
                        contentType,
                        hasBody: request.body !== null
                    }
                },
                { status: 400 }
            );
        }

        // Extract the image file
        const imageFileEntry = formData.get('imageFile');
        console.log('Image file entry type:', imageFileEntry ? imageFileEntry.constructor.name : 'null');
        console.log('Image file entry:', imageFileEntry);

        if (!imageFileEntry) {
            console.error('No imageFile field found in FormData');
            return NextResponse.json(
                { message: 'No imageFile field provided' },
                { status: 400 }
            );
        }

        if (!(imageFileEntry instanceof File)) {
            console.error('imageFile is not a File object:', typeof imageFileEntry);
            return NextResponse.json(
                { message: 'imageFile must be a File object' },
                { status: 400 }
            );
        }

        console.log('File details:', {
            name: imageFileEntry.name,
            size: imageFileEntry.size,
            type: imageFileEntry.type
        });

        if (imageFileEntry.size === 0) {
            console.error('Empty file provided');
            return NextResponse.json(
                { message: 'Empty file provided' },
                { status: 400 }
            );
        }

        // Extract title and subtitle (optional)
        const titleEntry = formData.get('title');
        const subtitleEntry = formData.get('subtitle');

        const title = typeof titleEntry === 'string' ? titleEntry || undefined : undefined;
        const subtitle = typeof subtitleEntry === 'string' ? subtitleEntry || undefined : undefined;

        console.log('Form fields:', { title, subtitle });

        // Convert file to buffer
        console.log('Converting file to buffer...');
        const arrayBuffer = await imageFileEntry.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('File buffer size:', buffer.length);

        // Add the banner
        console.log('Adding banner to service...');
        const banner = await bannerService.addBanner({
            imageBuffer: buffer,
            originalFilename: imageFileEntry.name,
            title,
            subtitle,
        });

        console.log('Banner added successfully:', banner.id);
        return NextResponse.json(banner);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in POSTHandler:', errorMessage);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
        
        return NextResponse.json(
            { 
                message: 'Error adding banner', 
                error: errorMessage 
            },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/banners - Delete a banner
async function DELETEHandler(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bannerId = searchParams.get('id');
        
        if (!bannerId) {
            return NextResponse.json(
                { message: 'Banner ID is required' },
                { status: 400 }
            );
        }

        await bannerService.deleteBanner(bannerId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json(
            { message: 'Error deleting banner' },
            { status: 500 }
        );
    }
}

// Apply admin authentication to all handlers
export const GET = (request: NextRequest) => withAdminAuth(request, GETHandler);
export const POST = (request: NextRequest) => withAdminAuth(request, POSTHandler);
export const DELETE = (request: NextRequest) => withAdminAuth(request, DELETEHandler);