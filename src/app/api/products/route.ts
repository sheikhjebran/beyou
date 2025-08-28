import { type NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/server/productService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (productId) {
            const product = await productService.getProductById(productId);
            if (!product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json(product);
        }

        const products = await productService.getProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const productId = await productService.addProduct(data);
        return NextResponse.json({ id: productId }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const data = await request.json();
        await productService.updateProduct(productId, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        await productService.deleteProduct(productId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
