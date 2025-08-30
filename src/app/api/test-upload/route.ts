import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/fileUpload';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const result = await saveFile('test', file);
        
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'File uploaded successfully',
            path: result.path
        });
    } catch (error) {
        console.error('Error in test upload:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
