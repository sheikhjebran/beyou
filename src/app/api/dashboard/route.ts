import { NextResponse } from 'next/server';
import { getProducts, getMostRecentProduct, getTodaysSalesSummary } from '@/services/server/productService';

export async function GET() {
    try {
        const productsData = await getProducts();
        const totalProducts = productsData.products.length;
        const zeroQuantityProducts = productsData.products.filter((p: any) => p.stock_quantity === 0);
        const recentProduct = await getMostRecentProduct();
        const salesSummary = await getTodaysSalesSummary();

        return NextResponse.json({
            products: productsData.products,
            totalProducts,
            zeroQuantityProducts,
            recentProduct,
            totalSales: salesSummary.totalSales,
            totalRevenue: salesSummary.totalRevenue,
            itemsSold: salesSummary.itemsSold,
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
