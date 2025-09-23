import { NextRequest, NextResponse } from 'next/server';
import { deleteProductImage, setPrimaryProductImage } from '@/services/server/imageService';

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const imagePath = searchParams.get('imagePath');

        if (!productId || !imagePath) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const result = await setPrimaryProductImage(productId, imagePath);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error setting primary image:', error);
        return NextResponse.json(
            { error: 'Failed to set primary image' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const imagePath = searchParams.get('imagePath');

        if (!productId || !imagePath) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const result = await deleteProductImage(productId, imagePath);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}
