import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';

export async function GET() {
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

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('imageFile') as File;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;

        if (!file) {
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
            subtitle
        });

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error adding banner:', error);
        return NextResponse.json(
            { message: 'Error adding banner' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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
