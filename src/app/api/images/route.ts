import { NextRequest } from 'next/server';
import { saveUploadedFile, deleteUploadedFile, ensureUploadDirs } from '@/lib/server/imageOperations';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string;

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        await ensureUploadDirs();

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await saveUploadedFile(buffer, file.name, category);

        return Response.json(result);
    } catch (error) {
        console.error('Error uploading file:', error);
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filepath = searchParams.get('path');

        if (!filepath) {
            return Response.json({ error: 'No file path provided' }, { status: 400 });
        }

        await deleteUploadedFile(filepath);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}
