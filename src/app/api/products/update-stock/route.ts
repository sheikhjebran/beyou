import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        // 1. Get and validate input
        const body = await request.json();
        console.log('Request body:', body);
        const productId = body.productId?.toString();
        const quantitySold = parseInt(body.quantitySold?.toString() || '0');
        
        if (!productId || !quantitySold || quantitySold < 1) {
            return NextResponse.json(
                { error: 'Invalid input: Product ID and quantity sold are required.' },
                { status: 400 }
            );
        }

        // 2. Get current product stock and price
        const result = await executeQuery(
            'SELECT id, name, stock_quantity, price FROM products WHERE id = ?',
            [productId]
        );

        console.log('Database result:', result);  // Debug log
        
        // In MySQL2, the result is already the rows array
        const rows = result;
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const product = rows[0];
        console.log('Product data after processing:', product);  // Debug log

        if (!product || typeof product !== 'object') {
            console.error('Invalid product data:', product);
            return NextResponse.json(
                { error: 'Invalid product data retrieved from database' },
                { status: 500 }
            );
        }

        if (!('id' in product) || !('name' in product) || !('stock_quantity' in product) || !('price' in product)) {
            console.error('Missing required product properties:', product);
            return NextResponse.json(
                { error: 'Product data is missing required properties' },
                { status: 500 }
            );
        }

        // 3. Log current stock and planned update
        console.log('Stock Update - Before:', {
            productId: product.id,
            productName: product.name,
            currentStock: product.stock_quantity,
            quantityToDeduct: quantitySold,
            newStockWillBe: product.stock_quantity - quantitySold
        });

        // 4. Validate stock level
        if (product.stock_quantity < quantitySold) {
            return NextResponse.json(
                { 
                    error: `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantitySold}` 
                },
                { status: 400 }
            );
        }

        // 5. Start transaction
        console.log('Starting transaction...');
        await executeQuery('START TRANSACTION');

        try {
            console.log('Updating stock quantity...');
            // Update the stock quantity
            const updateResult = await executeQuery(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [quantitySold, productId]
            );
            console.log('Stock update result:', updateResult);

            // Calculate sale amount
            const saleAmount = parseFloat(product.price) * quantitySold;
            console.log('Calculated sale amount:', saleAmount);

            console.log('Recording sale...');
            // Record the sale in sales table
            const saleResult = await executeQuery(
                'INSERT INTO sales (id, product_id, quantity_sold, sale_price_per_unit, total_amount, sale_date) VALUES (UUID(), ?, ?, ?, ?, NOW())',
                [productId, quantitySold, product.price, saleAmount]
            );
            console.log('Sale record result:', saleResult);

            console.log('Committing transaction...');
            // Commit the transaction
            await executeQuery('COMMIT');
            console.log('Transaction committed successfully');
        } catch (error) {
            console.error('Error in transaction:', error);
            await executeQuery('ROLLBACK');
            throw error;
        }

        // 6. Verify the updates
        const verifyResult = await executeQuery(
            'SELECT p.stock_quantity, s.id as sale_id, s.total_amount FROM products p LEFT JOIN sales s ON s.product_id = p.id WHERE p.id = ? ORDER BY s.sale_date DESC LIMIT 1',
            [productId]
        ) as any[];

        console.log('Verify result:', verifyResult); // Debug log

        if (!Array.isArray(verifyResult) || verifyResult.length === 0) {
            throw new Error('Failed to verify the update: No results returned');
        }

        const verifiedData = verifyResult[0];
        
        if (!verifiedData) {
            throw new Error('Failed to verify the update: Invalid data structure');
        }

        // 7. Log the result
        const updateResult = {
            productId: product.id,
            productName: product.name,
            originalStock: product.stock_quantity,
            deducted: quantitySold,
            newStock: verifiedData.stock_quantity,
            saleId: verifiedData.sale_id,
            saleAmount: verifiedData.total_amount
        };

        console.log('Stock Update - After:', updateResult);

        // 8. Revalidate pages to show updated stock
        revalidatePath('/products');

        // 9. Return success response
        return NextResponse.json({
            success: true,
            message: 'Stock updated and sale recorded successfully',
            ...updateResult
        });
        revalidatePath('/admin/inventory');

        // 9. Return success response
        return NextResponse.json({
            success: true,
            message: 'Stock updated successfully',
            details: {
                productId: product.id,
                productName: product.name,
                originalStock: product.stock_quantity,
                deducted: quantitySold,
                newStock: verifyResult[0].stock_quantity
            }
        });

    } catch (error: any) {
        console.error('Error updating stock:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update stock' },
            { status: 500 }
        );
    }
}
