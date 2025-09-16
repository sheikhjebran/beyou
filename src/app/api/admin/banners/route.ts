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

// POST /api/admin/banners - Add new banner
async function POSTHandler(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.error('Invalid content-type:', contentType);
            return NextResponse.json(
                { message: 'Invalid content-type. Expected multipart/form-data.' },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('imageFile') as File;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;

        if (!file) {
            console.error('No file provided in the request.');
            return NextResponse.json(
                { message: 'No file provided' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const banner = await bannerService.addBanner({
            imageBuffer: buffer,
            originalFilename: file.name,
            title,
            subtitle,
        });

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error adding banner:', error);
        return NextResponse.json(
            { message: 'Error adding banner', error: error.message },
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