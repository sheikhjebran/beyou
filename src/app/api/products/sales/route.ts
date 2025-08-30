import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received request body:', body);
        
        const productId = body.productId;
        const quantitySold = Number(body.quantitySold);
        
        console.log('Parsed sale request:', { productId, quantitySold });

        // Input validation
        if (!productId || !quantitySold || quantitySold < 1) {
            return NextResponse.json(
                { error: 'Invalid input: Product ID and quantity sold are required.' },
                { status: 400 }
            );
        }

        // Start transaction to ensure data consistency
        await executeQuery('START TRANSACTION');

        try {
            // Check current stock and get price
            const [rows] = await executeQuery(
                'SELECT stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
                [productId]
            ) as [any[], any];

            const productResult = rows[0];
            console.log('Database query result:', rows);

            if (!productResult) {
                await executeQuery('ROLLBACK');
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }

            const currentStock = productResult.stock_quantity;
            const pricePerUnit = productResult.price;
            console.log('Product details from DB:', { 
                productId, 
                currentStock, 
                pricePerUnit,
                quantitySold 
            });

            if (currentStock < quantitySold) {
                await executeQuery('ROLLBACK');
                return NextResponse.json(
                    { error: 'Insufficient stock' },
                    { status: 400 }
                );
            }

            // Update stock
            await executeQuery(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [quantitySold, productId]
            );

            // Calculate total amount
            const totalAmount = quantitySold * pricePerUnit;

            // Record the sale
            await executeQuery(
                'INSERT INTO sales (id, product_id, quantity_sold, sale_price_per_unit, total_amount, sale_date) VALUES (UUID(), ?, ?, ?, ?, NOW())',
                [productId, quantitySold, pricePerUnit, totalAmount]
            );

            // Commit the transaction
            await executeQuery('COMMIT');

            // Revalidate the products page to show updated stock
            revalidatePath('/products');
            revalidatePath('/admin/inventory');

            return NextResponse.json({ 
                message: 'Sale recorded and stock updated successfully' 
            });
        } catch (error) {
            await executeQuery('ROLLBACK');
            throw error;
        }
    } catch (error: any) {
        console.error('Error in POST /api/products/sales:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
