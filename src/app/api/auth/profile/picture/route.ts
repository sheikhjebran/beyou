import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { verifyAuth } from '@/lib/server/auth';
import { uploadImageToServer } from '@/lib/server/imageStorage';

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json({ message: 'Image is required' }, { status: 400 });
        }

        // Upload the image
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadedImage = await uploadImageToServer(buffer, image.name, 'profiles');

        // Update the user's profile picture in the database
        await executeQuery(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [uploadedImage.path, user.id]
        );

        return NextResponse.json({
            success: true,
            imageUrl: uploadedImage.path
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
