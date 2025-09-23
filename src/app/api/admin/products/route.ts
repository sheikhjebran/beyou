import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/services/server/productService';
import { withAdminAuth } from '@/middleware/admin-auth';

export async function GET(request: NextRequest) {
    return withAdminAuth(request, async (req) => {
        try {
            const result = await getProducts();
            return NextResponse.json(result.products);
        } catch (error) {
            console.error('Error in GET /api/admin/products:', error);
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Internal server error' },
                { status: 500 }
            );
        }
    });
}