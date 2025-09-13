import { type NextRequest, NextResponse } from 'next/server';
import * as productService from '@/services/server/productService';
import { saveFile } from '@/lib/fileUpload';

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
        const subcategory = formData.get('subCategory') as string || null;
        const description = formData.get('description') as string;
        const price = Number(formData.get('price'));
        const stock_quantity = Number(formData.get('stock_quantity')) || 0; // Default to 0 if null
        
        // Get image paths from the pre-uploaded images
        const image_paths = formData.getAll('imagePaths').map(path => path.toString());
        const primary_image_path = formData.get('primaryImagePath')?.toString() || image_paths[0] || null;
        
        // Log the received image data
        console.log('Received image data:', {
            image_paths,
            primary_image_path
        });

        const data = {
            name,
            category,
            subcategory,
            description,
            price,
            stock_quantity,
            is_best_seller: false, // default value
            primary_image_path,
            image_paths
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
        console.log('DELETE /api/products called');
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        console.log('Delete request for product ID:', productId);

        if (!productId) {
            console.log('No product ID provided');
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        console.log('Calling server deleteProduct function...');
        const result = await productService.deleteProduct(productId);
        console.log('Delete result:', result);
        
        if (!result) {
            console.log('Delete failed - no rows affected');
            return NextResponse.json({ error: 'Product not found or could not be deleted' }, { status: 404 });
        }
        
        console.log('Product deleted successfully');
        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/products:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
