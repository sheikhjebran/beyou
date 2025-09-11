import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/services/server/productServerService';

interface RouteContext {
    params: {
        productId: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const product = await getProductById(params.productId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error in GET /api/products/[productId]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
