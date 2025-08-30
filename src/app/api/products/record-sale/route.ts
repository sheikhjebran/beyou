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

        // First, get current stock
        const [currentStockResult] = await executeQuery(
            'SELECT id, name, stock_quantity FROM products WHERE id = ?',
            [productId]
        ) as [any[], any];

        if (!currentStockResult || currentStockResult.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const product = currentStockResult[0];
        console.log('Before update - Product details:', {
            productId: product.id,
            productName: product.name,
            currentStock: product.stock_quantity,
            quantityToDeduct: quantitySold,
            newStockWillBe: product.stock_quantity - quantitySold
        });

            const productResult = rows[0];
            // Get full product details
            const [productDetails] = await executeQuery(
                'SELECT id, name, stock_quantity, price FROM products WHERE id = ?',
                [productId]
            ) as [any[], any];

            const product = productDetails[0];
            const currentStock = product.stock_quantity;
            const pricePerUnit = product.price;

            console.log('Product update details:', { 
                productId: product.id,
                productName: product.name,
                currentStock,
                quantityToDeduct: quantitySold,
                newStockAfterSale: currentStock - quantitySold,
                pricePerUnit,
                totalSaleAmount: pricePerUnit * quantitySold
            });

            if (currentStock < quantitySold) {
                await executeQuery('ROLLBACK');
                return NextResponse.json(
                    { error: 'Insufficient stock' },
                    { status: 400 }
                );
            }

            console.log(`About to update stock for product "${product.name}" (ID: ${product.id})`);
            console.log(`Current stock: ${currentStock}, Deducting: ${quantitySold}, New stock will be: ${currentStock - quantitySold}`);

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
            console.error('Transaction error:', error);
            await executeQuery('ROLLBACK');
            throw error;
        }
    } catch (error: any) {
        console.error('Error in POST /api/products/record-sale:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
