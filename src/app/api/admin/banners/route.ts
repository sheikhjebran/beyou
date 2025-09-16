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

// POST /api/admin/banners - Add new banner
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

        console.log('Parsing FormData...');
        let file: File | null = null;
        let title = '';
        let subtitle = '';
        let processedViaManualParsing = false;
        
        try {
            const formData = await request.formData();
            console.log('FormData keys:', Array.from(formData.keys()));
            
            file = formData.get('imageFile') as File;
            title = formData.get('title') as string || '';
            subtitle = formData.get('subtitle') as string || '';
        } catch (parseError) {
            console.error('Standard FormData parsing failed, trying manual parser:', parseError);
            
            try {
                const parsedData = await parseMultipartFormData(request.clone());
                console.log('Manual parser succeeded. Fields:', Object.keys(parsedData.fields), 'Files:', Object.keys(parsedData.files));
                
                title = parsedData.fields.title || '';
                subtitle = parsedData.fields.subtitle || '';
                
                if (parsedData.files.imageFile) {
                    const fileData = parsedData.files.imageFile;
                    // For manual parsing, process directly with buffer
                    const buffer = fileData.buffer;

                    console.log('Manual parsing - calling server addBanner function directly...');
                    const banner = await bannerService.addBanner({
                        imageBuffer: buffer,
                        originalFilename: fileData.name,
                        title,
                        subtitle,
                    });

                    console.log('Banner added successfully via manual parsing:', banner.id);
                    return NextResponse.json(banner);
                } else {
                    return NextResponse.json(
                        { message: 'No file found in manual parsing' },
                        { status: 400 }
                    );
                }
            } catch (manualParseError) {
                console.error('Manual FormData parsing also failed:', manualParseError);
                return NextResponse.json(
                    { message: 'Failed to parse FormData with both methods', error: manualParseError instanceof Error ? manualParseError.message : 'Unknown parsing error' },
                    { status: 400 }
                );
            }
        }

        // Standard FormData parsing succeeded, continue with normal flow
        console.log('Extracted data:', {
            fileExists: !!file,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
            title,
            subtitle
        });

        if (!file || !(file instanceof File)) {
            console.error('No valid file provided in the request.');
            return NextResponse.json(
                { message: 'No valid file provided' },
                { status: 400 }
            );
        }

        console.log('Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log('Calling server addBanner function...');
        const banner = await bannerService.addBanner({
            imageBuffer: buffer,
            originalFilename: file.name,
            title,
            subtitle,
        });

        console.log('Banner added successfully:', banner.id);
        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error adding banner:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
        return NextResponse.json(
            { 
                message: 'Error adding banner', 
                error: error instanceof Error ? error.message : 'Unknown error'
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