import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';
import { parseMultipartFormData } from '@/lib/parseMultipartFormData';

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

// Enhanced debugging and fallback for empty request body issue
async function POSTHandler(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');
        console.log('Request content-type:', contentType);

        // Log raw headers for debugging
        console.log('Request headers:', Object.fromEntries(request.headers.entries()));

        // Attempt to read the raw request body
        let bodyText = '';
        try {
            bodyText = await request.text();
            console.log('Raw request body length:', bodyText.length);
            console.log('Raw request body preview:', bodyText.substring(0, 100) + (bodyText.length > 100 ? '...' : ''));
        } catch (error) {
            console.error('Failed to read raw request body:', error);
        }

        if (!bodyText || bodyText.trim().length === 0) {
            console.error('Empty request body received');
            return NextResponse.json(
                { message: 'Empty request body' },
                { status: 400 }
            );
        }

        // Reset the request body for further processing
        request = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: bodyText,
        });

        if (contentType && contentType.includes('application/json')) {
            console.log('Processing JSON request with base64 file...');
            let requestData;
            try {
                requestData = JSON.parse(bodyText);
            } catch (parseError) {
                const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
                console.error('JSON parsing failed:', errorMessage);
                return NextResponse.json(
                    { message: 'Invalid JSON in request body', error: errorMessage },
                    { status: 400 }
                );
            }

            if (!requestData.imageFile || !requestData.imageFile.data) {
                return NextResponse.json(
                    { message: 'No file data provided' },
                    { status: 400 }
                );
            }

            const base64Data = requestData.imageFile.data;
            const buffer = Buffer.from(base64Data, 'base64');

            const banner = await bannerService.addBanner({
                imageBuffer: buffer,
                originalFilename: requestData.imageFile.name,
                title: requestData.title,
                subtitle: requestData.subtitle,
            });

            console.log('Banner added successfully via JSON:', banner.id);
            return NextResponse.json(banner);
        }

        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.error('Invalid content-type:', contentType);
            return NextResponse.json(
                { message: 'Invalid content-type. Expected application/json or multipart/form-data.' },
                { status: 400 }
            );
        }

        console.log('Processing FormData request...');
        const formData = await request.formData();
        console.log('FormData keys:', Array.from(formData.keys()));

        const imageFileEntry = formData.get('imageFile');
        if (!imageFileEntry || !(imageFileEntry instanceof File)) {
            console.error('No valid file provided in FormData');
            return NextResponse.json(
                { message: 'No valid file provided' },
                { status: 400 }
            );
        }

        const titleEntry = formData.get('title');
        const subtitleEntry = formData.get('subtitle');

        const title = typeof titleEntry === 'string' ? titleEntry : undefined;
        const subtitle = typeof subtitleEntry === 'string' ? subtitleEntry : undefined;

        const buffer = await imageFileEntry.arrayBuffer();
        const banner = await bannerService.addBanner({
            imageBuffer: Buffer.from(buffer),
            originalFilename: imageFileEntry.name,
            title,
            subtitle,
        });

        console.log('Banner added successfully:', banner.id);
        return NextResponse.json(banner);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error adding banner:', errorMessage);
        return NextResponse.json(
            { message: 'Error adding banner', error: errorMessage },
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