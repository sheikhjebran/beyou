import { NextResponse } from 'next/server';
import { getProducts, getMostRecentProduct, getTodaysSalesSummary } from '@/services/server/productService';

export async function GET() {
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
            error: null
        });
    } catch (error) {
        console.error("Error in dashboard route:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
