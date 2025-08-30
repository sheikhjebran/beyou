'use client'

import { Product } from '@/types/product';
import type { AddProductData } from '@/types/productForm';
import { 
    UpdateProductData, 
    TodaysSalesSummary, 
    ProductSaleSummary, 
    TopSaleByQuantity, 
    ProductRevenueSummary 
} from './server/productService';
import { uploadImage } from '@/lib/imageStorage';

export type PaginatedProducts = {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export async function getProducts(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
        category?: string;
        subCategory?: string;
        minPrice?: number;
        maxPrice?: number;
        isBestSeller?: boolean;
    }
): Promise<PaginatedProducts> {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.subCategory && { subCategory: filters.subCategory }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.isBestSeller !== undefined && { isBestSeller: filters.isBestSeller.toString() }),
    });

    const response = await fetch(`/api/products?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
}

export async function getBestSellingProducts(): Promise<Product[]> {
    const response = await fetch('/api/products?operation=bestSelling');
    if (!response.ok) {
        throw new Error('Failed to fetch best selling products');
    }
    const data = await response.json();
    return data.products || [];
}

export async function getMostRecentProduct(): Promise<Product | null> {
    const response = await fetch('/api/products?operation=mostRecent');
    if (!response.ok) {
        throw new Error('Failed to fetch most recent product');
    }
    return response.json();
}

export async function getProductById(productId: string): Promise<Product | null> {
    const response = await fetch(`/api/products?id=${productId}`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch product');
    }
    return response.json();
}

export async function addProduct(productData: AddProductData): Promise<string> {
    try {
        // Upload images first
        const uploadedImages = await Promise.all(
            productData.imageFiles.map((file: File) => uploadImage(file, 'products'))
        );

        // Create form data with the image URLs
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('category', productData.category);
        formData.append('subCategory', productData.subCategory || '');
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('stock_quantity', productData.stock_quantity.toString());
        formData.append('primaryImageIndex', productData.primaryImageIndex.toString());
        
        // Add image paths
        uploadedImages.forEach((image: { path: string }, index: number) => {
            formData.append('imagePaths', image.path);
            if (index === productData.primaryImageIndex) {
                formData.append('primaryImagePath', image.path);
            }
        });

        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to add product');
        }
        
        const result = await response.json();
        return result.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
    const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error('Failed to update product');
    }
}

export async function deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete product');
    }
}

export async function getTodaysSalesSummary(): Promise<TodaysSalesSummary> {
    const response = await fetch('/api/products?operation=salesSummary');
    if (!response.ok) {
        throw new Error('Failed to fetch today\'s sales summary');
    }
    return response.json();
}

export async function getProductSalesSummary(
    limit?: number,
    startDate?: Date,
    endDate?: Date
): Promise<ProductSaleSummary[]> {
    let url = '/api/products?operation=productSalesSummary';
    if (limit) url += `&limitCount=${limit}`;
    if (startDate) url += `&startDate=${startDate.toISOString()}`;
    if (endDate) url += `&endDate=${endDate.toISOString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch product sales summary');
    }
    return response.json();
}

export async function getTopSalesByQuantity(
    limit?: number,
    startDate?: Date,
    endDate?: Date
): Promise<TopSaleByQuantity[]> {
    let url = '/api/products?operation=topSalesByQuantity';
    if (limit) url += `&limitCount=${limit}`;
    if (startDate) url += `&startDate=${startDate.toISOString()}`;
    if (endDate) url += `&endDate=${endDate.toISOString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch top sales by quantity');
    }
    return response.json();
}

export async function getProductRevenueSummary(
    limit?: number,
    startDate?: Date,
    endDate?: Date
): Promise<ProductRevenueSummary[]> {
    let url = '/api/products?operation=productRevenueSummary';
    if (limit) url += `&limitCount=${limit}`;
    if (startDate) url += `&startDate=${startDate.toISOString()}`;
    if (endDate) url += `&endDate=${endDate.toISOString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch product revenue summary');
    }
    return response.json();
}

export async function updateProductBestSellerStatus(productId: string, isBestSeller: boolean): Promise<void> {
    const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_best_seller: isBestSeller }), // Match the backend property name
    });
    if (!response.ok) {
        throw new Error('Failed to update product best seller status');
    }
}

export async function recordSaleAndUpdateStock(productId: string, quantitySold: number): Promise<void> {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operation: 'recordSale',
            productId,
            quantitySold,
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to record sale and update stock');
    }
}
