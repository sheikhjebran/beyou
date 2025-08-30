import { type NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/server/productService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        // Cache configuration
        const cacheConfig = {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        };

        if (productId) {
            const product = await productService.getProductById(productId);
            if (!product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json(product, cacheConfig);
        }

        // Get pagination parameters from query
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        
        // Get filter parameters
        const category = searchParams.get('category') || undefined;
        const subCategory = searchParams.get('subCategory') || undefined;
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const isBestSeller = searchParams.get('isBestSeller') ? searchParams.get('isBestSeller') === 'true' : undefined;

        const result = await productService.getProducts(page, pageSize, {
            category,
            subCategory,
            minPrice,
            maxPrice,
            isBestSeller
        });
        
        return NextResponse.json(result);
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
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;
        const subCategory = formData.get('subCategory') as string;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const stockQuantity = Number(formData.get('stockQuantity'));
        const imageFiles = formData.getAll('images') as File[];

        // Process image files to get URLs
        const imageUrls = ['placeholder_url']; // This should be replaced with actual image upload logic
        const primaryImageUrl = imageUrls[0];

        const data = {
            name,
            category,
            subCategory,
            description,
            price,
            stockQuantity,
            isBestSeller: false, // default value
            primaryImageUrl,
            imageUrls
        };

        const result = await productService.addProduct(data);
        
        if (!result) {
            return NextResponse.json(
                { error: 'Failed to add product' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: `Product "${name}" (ID: ${result.id}) has been successfully added.`,
            product: result
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
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
