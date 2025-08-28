import { getProducts, getMostRecentProduct, getTodaysSalesSummary } from '@/services/server/productService';
import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/admin-auth';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    return withAdminAuth(request, async (req) => {
        try {
            console.log('Starting dashboard data fetch...');
            
            // Fetch products first to validate database connection
            console.log('Fetching products...');
            const products = await getProducts();
            console.log(`Successfully fetched ${products.length} products`);

            // Then fetch other data
            console.log('Fetching additional data...');
            const [recentProduct, salesSummary] = await Promise.all([
                getMostRecentProduct(),
                getTodaysSalesSummary()
            ]);
            console.log('Successfully fetched additional data');

            const totalProducts = products.length;
            const zeroQuantityProducts = products.filter(p => p.quantity === 0);

            const responseData = {
                products,
                totalProducts,
                zeroQuantityProducts,
                recentProduct,
                ordersToday: salesSummary.ordersToday,
                salesTodayAmount: salesSummary.salesTodayAmount,
            };

            console.log('Dashboard data fetch completed successfully');
            return NextResponse.json(responseData);
        } catch (error) {
            console.error('Detailed error in dashboard API:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            
            const errorMessage = error instanceof Error 
                ? `Failed to fetch dashboard data: ${error.message}`
                : 'Failed to fetch dashboard data: Unknown error';
                
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    });
    try {
        const products = await getProducts();
        const totalProducts = products.length;
        const zeroQuantityProducts = products.filter(p => p.quantity === 0);
        const recentProduct = await getMostRecentProduct();
        const { ordersToday, salesTodayAmount } = await getTodaysSalesSummary();

        return NextResponse.json({
            products,
            totalProducts,
            zeroQuantityProducts,
            recentProduct,
            ordersToday,
            salesTodayAmount,
        });
    } catch (error) {
        console.error('Error in dashboard API:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
