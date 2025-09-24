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
        
        if (contentType && contentType.includes('application/json')) {
            // Handle JSON request with base64 encoded file
            console.log('Processing JSON request with base64 file...');
            
            let requestData;
            try {
                // Check if request body exists and has content
                const bodyText = await request.text();
                console.log('Raw request body length:', bodyText.length);
                console.log('Raw request body preview:', bodyText.substring(0, 100) + (bodyText.length > 100 ? '...' : ''));
                
                if (!bodyText || bodyText.length === 0) {
                    console.error('Empty request body received');
                    return NextResponse.json(
                        { message: 'Empty request body' },
                        { status: 400 }
                    );
                }
                
                requestData = JSON.parse(bodyText);
            } catch (parseError) {
                console.error('JSON parsing failed:', parseError);
                return NextResponse.json(
                    { message: 'Invalid JSON in request body', error: parseError instanceof Error ? parseError.message : 'Unknown error' },
                    { status: 400 }
                );
            }
            
            console.log('Request data received:', {
                hasImageFile: !!requestData.imageFile,
                imageFileName: requestData.imageFile?.name,
                imageFileSize: requestData.imageFile?.size,
                title: requestData.title,
                subtitle: requestData.subtitle
            });
            
            if (!requestData.imageFile || !requestData.imageFile.data) {
                return NextResponse.json(
                    { message: 'No file data provided' },
                    { status: 400 }
                );
            }
            
            // Convert base64 back to buffer
            const base64Data = requestData.imageFile.data;
            const buffer = Buffer.from(base64Data, 'base64');
            
            console.log('Converted base64 to buffer, size:', buffer.length);
            
            const banner = await bannerService.addBanner({
                imageBuffer: buffer,
                originalFilename: requestData.imageFile.name,
                title: requestData.title,
                subtitle: requestData.subtitle,
            });

            console.log('Banner added successfully via JSON:', banner.id);
            return NextResponse.json(banner);
        }
        
        // Fallback to FormData handling for backward compatibility
        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.error('Invalid content-type:', contentType);
            return NextResponse.json(
                { message: 'Invalid content-type. Expected application/json or multipart/form-data.' },
                { status: 400 }
            );
        }

        console.log('Processing FormData request...');
        let file: File | null = null;
        let title = '';
        let subtitle = '';
        
        // First, clone the request so we can try manual parsing if needed
        const requestClone = request.clone();
        
        try {
            // Clone request for backup parsing
            const formData = await request.formData();
            console.log('FormData keys:', Array.from(formData.keys()));
            
            const imageFileEntry = formData.get('imageFile');
            console.log('Image file entry type:', imageFileEntry?.constructor.name);
            
            if (imageFileEntry && (imageFileEntry instanceof File || imageFileEntry instanceof Blob)) {
                file = imageFileEntry as File;
                console.log('File details:', {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            } else {
                console.log('imageFile is not a File/Blob:', imageFileEntry);
            }
            
            title = formData.get('title') as string || '';
            subtitle = formData.get('subtitle') as string || '';
            
            console.log('Standard FormData parsing succeeded');
        } catch (parseError) {
            console.error('Standard FormData parsing failed, trying manual parser:', parseError);
            
            try {
                const parsedData = await parseMultipartFormData(requestClone);
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
                    console.error('No file found in manual parsing');
                    return NextResponse.json(
                        { message: 'No file found in request' },
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