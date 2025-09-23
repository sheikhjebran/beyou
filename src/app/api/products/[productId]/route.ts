import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/services/server/productServerService';

export async function GET(
    request: NextRequest,
    segmentData: any
) {
    const params = await segmentData.params;
    const { productId } = params;
    try {
        const product = await getProductById(productId);

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
