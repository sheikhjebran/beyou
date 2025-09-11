import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/fileUpload';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const directory = formData.get('directory') as string | null || 'products';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const result = await saveFile(directory, file);
        
        return NextResponse.json({
            path: result.path,
            size: file.size,
            type: file.type
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
