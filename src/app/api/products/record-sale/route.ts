import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const productId = body.productId?.toString();
        const quantitySold = parseInt(body.quantitySold?.toString() || '0');
        
        // Input validation
        if (!productId || !quantitySold || quantitySold < 1) {
            return NextResponse.json(
                { error: 'Invalid input: Product ID and quantity sold are required.' },
                { status: 400 }
            );
        }

        // Get product details
        const [productDetails] = await executeQuery(
            'SELECT id, name, stock_quantity, price FROM products WHERE id = ?',
            [productId]
        ) as [any[], any];

        if (!productDetails || productDetails.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const product = productDetails[0];
        const currentStock = product.stock_quantity;
        const pricePerUnit = product.price;

        // Check stock availability
        if (currentStock < quantitySold) {
            return NextResponse.json(
                { error: 'Insufficient stock' },
                { status: 400 }
            );
        }

        // Start transaction
        await executeQuery('BEGIN');

        try {
            // Update stock
            await executeQuery(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [quantitySold, productId]
            );

            // Record sale
            const totalAmount = quantitySold * pricePerUnit;
            await executeQuery(
                'INSERT INTO sales (id, product_id, quantity_sold, sale_price_per_unit, total_amount, sale_date) VALUES (UUID(), ?, ?, ?, ?, NOW())',
                [productId, quantitySold, pricePerUnit, totalAmount]
            );

            await executeQuery('COMMIT');

            // Revalidate pages
            revalidatePath('/products');
            revalidatePath('/admin/inventory');

            return NextResponse.json({
                message: 'Sale recorded and stock updated successfully'
            });
        } catch (error) {
            await executeQuery('ROLLBACK');
            throw error; // Re-throw to be caught by outer try-catch
        }
    } catch (error: any) {
        console.error('Error in POST /api/products/record-sale:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
