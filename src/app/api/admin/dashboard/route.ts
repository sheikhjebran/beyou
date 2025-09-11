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
            const productsData = await getProducts();
            console.log(`Successfully fetched ${productsData.products.length} products`);

            // Then fetch other data
            console.log('Fetching additional data...');
            const [recentProduct, salesSummary] = await Promise.all([
                getMostRecentProduct(),
                getTodaysSalesSummary()
            ]);
            console.log('Successfully fetched additional data');

            const totalProducts = productsData.products.length;
            const zeroQuantityProducts = productsData.products.filter((p: any) => p.stock_quantity === 0);

            const responseData = {
                products: productsData.products,
                totalProducts,
                zeroQuantityProducts,
                recentProduct,
                totalSales: salesSummary.totalSales,
                totalRevenue: salesSummary.totalRevenue,
                itemsSold: salesSummary.itemsSold,
            };

            console.log('Dashboard data fetch completed successfully');
            return NextResponse.json(responseData);
        } catch (error: any) {
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
}
