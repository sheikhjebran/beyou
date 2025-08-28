import { NextRequest, NextResponse } from 'next/server';
import * as categoryImageService from '@/services/server/categoryImageService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId) {
            return NextResponse.json(
                { message: 'Category ID is required' },
                { status: 400 }
            );
        }

        const categoryImage = await categoryImageService.getCategoryImage(categoryId);
        
        if (!categoryImage) {
            return NextResponse.json(null, { status: 404 });
        }

        return NextResponse.json(categoryImage);
    } catch (error) {
        console.error('Error getting category image:', error);
        return NextResponse.json(
            { message: 'Error fetching category image' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const categoryId = formData.get('categoryId') as string;
        const imageFile = formData.get('imageFile') as File;

        if (!categoryId || !imageFile) {
            return NextResponse.json(
                { message: 'Category ID and image file are required' },
                { status: 400 }
            );
        }

        const { uploadImageToServer } = await import('@/lib/server/imageStorage');
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const subDirectory = `categories/${categoryId}`;
        const uploadedImage = await uploadImageToServer(buffer, imageFile.name, subDirectory);
        const imagePath = uploadedImage.path;

        await categoryImageService.updateCategoryImage(categoryId, imagePath);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating category image:', error);
        return NextResponse.json(
            { message: 'Error updating category image' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId) {
            return NextResponse.json(
                { message: 'Category ID is required' },
                { status: 400 }
            );
        }

        await categoryImageService.deleteCategoryImage(categoryId);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category image:', error);
        return NextResponse.json(
            { message: 'Error deleting category image' },
            { status: 500 }
        );
    }
}
