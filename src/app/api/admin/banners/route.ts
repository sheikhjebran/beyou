import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';
import formidable from 'formidable';
import { promises as fs } from 'fs';

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

// Fixed POSTHandler using formidable for reliable multipart parsing
async function POSTHandler(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');
        console.log('Request content-type:', contentType);

        // Log raw headers for debugging
        console.log('Request headers:', Object.fromEntries(request.headers.entries()));

        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.error('Invalid content-type:', contentType);
            return NextResponse.json(
                { message: 'Invalid content-type. Expected multipart/form-data.' },
                { status: 400 }
            );
        }

        console.log('Processing FormData request with formidable...');

        // Convert NextRequest to Node.js IncomingMessage format for formidable
        const body = await request.arrayBuffer();
        const buffer = Buffer.from(body);

        // Create a mock IncomingMessage-like object
        const mockRequest = {
            headers: Object.fromEntries(request.headers.entries()),
            method: request.method,
            url: request.url,
            body: buffer,
            pipe: (dest: any) => {
                dest.write(buffer);
                dest.end();
                return dest;
            },
            on: (event: string, callback: Function) => {
                if (event === 'data') {
                    callback(buffer);
                } else if (event === 'end') {
                    callback();
                }
            },
            pause: () => {},
            resume: () => {},
            read: () => buffer,
        } as any;

        const form = new formidable.IncomingForm({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
        });

        const parseFormData = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
            return new Promise((resolve, reject) => {
                form.parse(mockRequest, (err, fields, files) => {
                    if (err) {
                        console.error('Formidable parsing error:', err);
                        reject(err);
                    } else {
                        console.log('Formidable parsed successfully');
                        console.log('Fields:', Object.keys(fields));
                        console.log('Files:', Object.keys(files));
                        resolve({ fields, files });
                    }
                });
            });
        };

        const { fields, files } = await parseFormData();

        // Extract the image file
        const imageFile = Array.isArray(files.imageFile) ? files.imageFile[0] : files.imageFile;
        
        if (!imageFile) {
            console.error('No image file found in upload');
            return NextResponse.json(
                { message: 'No image file provided' },
                { status: 400 }
            );
        }

        console.log('Image file details:', {
            originalFilename: imageFile.originalFilename,
            size: imageFile.size,
            mimetype: imageFile.mimetype,
            filepath: imageFile.filepath
        });

        // Read the file content
        const fileBuffer = await fs.readFile(imageFile.filepath);
        console.log('File buffer size:', fileBuffer.length);

        // Extract title and subtitle (optional)
        const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || '';
        const subtitle = Array.isArray(fields.subtitle) ? fields.subtitle[0] : fields.subtitle || '';

        console.log('Form data:', { title, subtitle });

        // Add the banner
        const banner = await bannerService.addBanner({
            imageBuffer: fileBuffer,
            originalFilename: imageFile.originalFilename || 'upload.jpg',
            title: title || undefined,
            subtitle: subtitle || undefined,
        });

        console.log('Banner added successfully:', banner.id);

        // Clean up temp file
        try {
            await fs.unlink(imageFile.filepath);
        } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
        }

        return NextResponse.json(banner);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error adding banner:', errorMessage);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
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