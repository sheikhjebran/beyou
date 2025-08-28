import pool, { executeQuery } from '@/lib/server/mysql';
import { Product } from '@/types/product';

const DEFAULT_PRIMARY_IMAGE_URL = 'https://placehold.co/400x300.png';

// Type for updating product images
export type UpdateProductImageData = {
    imageFiles?: File[] | null;
    newPrimaryImageIndexForUpload?: number;
    makeExistingImagePrimary?: string;
};

// Type for adding new products
export type AddProductData = {
    name: string;
    category: string;
    subCategory: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageFiles?: File[];
};

// Type for updating products
export type UpdateProductData = {
    name: string;
    category: string;
    subCategory: string;
    description: string;
    price: number;
    quantity: number;
    imageUpdateData?: UpdateProductImageData;
};

// Type for today's sales summary
export type TodaysSalesSummary = {
    ordersToday: number;
    salesTodayAmount: number;
};

// Type for product sales summary (for analytics)
export type ProductSaleSummary = {
    productId: string;
    productName: string;
    totalQuantitySold: number;
};

// Type for top sales by quantity in a single order
export type TopSaleByQuantity = {
    id: string;
    productName: string;
    quantitySold: number;
    saleDate: string;
};

// Type for product revenue summary (for analytics)
export type ProductRevenueSummary = {
    productId: string;
    productName: string;
    totalRevenue: number;
};

export async function getProducts(): Promise<Product[]> {
    try {
        console.log('Attempting to connect to database and fetch products...');
        
        const query = `
            SELECT p.*, 
                GROUP_CONCAT(pi.image_path) as image_paths,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        `;

        console.log('Executing query:', query);
        
        const rows = await executeQuery<any[]>(query);

        if (!Array.isArray(rows)) {
            throw new Error('Failed to fetch products: Invalid response format');
        }

        return rows.map(row => ({
            id: row.id,
            name: row.name || 'Unnamed Product',
            category: row.category || 'Other',
            subCategory: row.subcategory || 'Miscellaneous',
            description: row.description || 'No description available.',
            price: Number(row.price) || 0,
            primaryImageUrl: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
            imageUrls: row.image_paths ? row.image_paths.split(',') : [],
            stockQuantity: Number(row.stock_quantity) || 0,
            isBestSeller: Boolean(row.is_best_seller),
            createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? row.updated_at.toISOString() : new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error in getProducts:', error);
        throw new Error('Failed to fetch products: Database error');
    }

    return rows.map(row => ({
        id: row.id,
        name: row.name || 'Unnamed Product',
        category: row.category || 'Other',
        subCategory: row.sub_category || 'Miscellaneous',
        description: row.description || 'No description available.',
        price: Number(row.price) || 0,
        primaryImageUrl: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
        imageUrls: row.image_paths ? row.image_paths.split(',') : [],
        quantity: Number(row.quantity) || 0,
        isBestSeller: Boolean(row.is_best_seller),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    }));
}

export async function getBestSellingProducts(): Promise<Product[]> {
    const rows = await executeQuery<any[]>(`
        SELECT p.*, 
               GROUP_CONCAT(pi.image_path) as image_paths,
               (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.is_best_seller = true
        GROUP BY p.id
        ORDER BY p.updated_at DESC
    `);

    return rows.map(row => ({
        id: row.id,
        name: row.name || 'Unnamed Product',
        category: row.category || 'Other',
        subCategory: row.sub_category || 'Miscellaneous',
        description: row.description || 'No description available.',
        price: Number(row.price) || 0,
        primaryImageUrl: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
        imageUrls: row.image_paths ? row.image_paths.split(',') : [],
        quantity: Number(row.quantity) || 0,
        isBestSeller: true,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    }));
}

export async function getMostRecentProduct(): Promise<Product | null> {
    const rows = await executeQuery<any[]>(`
        SELECT p.*, 
               GROUP_CONCAT(pi.image_path) as image_paths,
               (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 1
    `);

    if (rows.length === 0) {
        return null;
    }

    const row = rows[0];
    return {
        id: row.id,
        name: row.name || 'Unnamed Product',
        category: row.category || 'Other',
        subCategory: row.sub_category || 'Miscellaneous',
        description: row.description || 'No description available.',
        price: Number(row.price) || 0,
        primaryImageUrl: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
        imageUrls: row.image_paths ? row.image_paths.split(',') : [],
        quantity: Number(row.quantity) || 0,
        isBestSeller: Boolean(row.is_best_seller),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    };
}

export async function getProductById(productId: string): Promise<Product | null> {
    const rows = await executeQuery<any[]>(`
        SELECT p.*, 
               GROUP_CONCAT(pi.image_path) as image_paths,
               (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = ?
        GROUP BY p.id
    `, [productId]);

    if (rows.length === 0) {
        return null;
    }

    const row = rows[0];
    return {
        id: row.id,
        name: row.name || 'Unnamed Product',
        category: row.category || 'Other',
        subCategory: row.sub_category || 'Miscellaneous',
        description: row.description || 'No description available.',
        price: Number(row.price) || 0,
        primaryImageUrl: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
        imageUrls: row.image_paths ? row.image_paths.split(',') : [],
        quantity: Number(row.quantity) || 0,
        isBestSeller: Boolean(row.is_best_seller),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
    };
}

export async function addProduct(productData: AddProductData): Promise<string> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert product
        const [result] = await connection.query(`
            INSERT INTO products (
                name, category, subcategory, description, price, 
                stock_quantity, is_best_seller, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            productData.name,
            productData.category,
            productData.subCategory,
            productData.description,
            productData.price,
            productData.stockQuantity,
            false // default is_best_seller to false for new products
        ]);

        const productId = (result as any).insertId;

        // Insert images if provided
        if (productData.imageFiles?.length) {
            for (let i = 0; i < productData.imageFiles.length; i++) {
                await connection.query(`
                    INSERT INTO product_images (
                        product_id, image_path, is_primary, created_at, updated_at
                    ) VALUES (?, ?, ?, NOW(), NOW())
                `, [
                    productId,
                    productData.imageFiles[i].name, // Store the image path
                    i === 0 // First image is primary by default
                ]);
            }
        }

        await connection.commit();
        return productId.toString();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update product
        await connection.query(`
            UPDATE products 
            SET name = ?, category = ?, subcategory = ?, description = ?, 
                price = ?, stock_quantity = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            productData.name,
            productData.category,
            productData.subCategory,
            productData.description,
            productData.price,
            productData.quantity,
            productId
        ]);

        // Handle image updates if provided
        if (productData.imageUpdateData) {
            const { imageFiles, makeExistingImagePrimary, newPrimaryImageIndexForUpload } = productData.imageUpdateData;

            // If making an existing image primary
            if (makeExistingImagePrimary) {
                await connection.query(`
                    UPDATE product_images 
                    SET is_primary = CASE 
                        WHEN image_path = ? THEN true 
                        ELSE false 
                    END
                    WHERE product_id = ?
                `, [makeExistingImagePrimary, productId]);
            }

            // Upload new images if provided
            if (imageFiles?.length) {
                for (let i = 0; i < imageFiles.length; i++) {
                    await connection.query(`
                        INSERT INTO product_images (
                            product_id, image_path, is_primary, created_at, updated_at
                        ) VALUES (?, ?, ?, NOW(), NOW())
                    `, [
                        productId,
                        imageFiles[i].name,
                        i === (newPrimaryImageIndexForUpload || 0) && !makeExistingImagePrimary
                    ]);
                }
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteProduct(productId: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Delete product images first (due to foreign key constraint)
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

        // Delete the product
        await connection.query('DELETE FROM products WHERE id = ?', [productId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function getTodaysSalesSummary(): Promise<TodaysSalesSummary> {
    const [rows] = await executeQuery<any[]>(`
        SELECT COUNT(*) as ordersToday, 
               SUM(quantity_sold * price) as salesTodayAmount
        FROM product_sales
        WHERE DATE(sale_date) = CURDATE()
    `);

    const row = rows[0];
    return {
        ordersToday: row.ordersToday || 0,
        salesTodayAmount: Number(row.salesTodayAmount) || 0
    };
}

export async function getProductSalesSummary(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<ProductSaleSummary[]> {
    const dateFilter = startDate && endDate
        ? 'WHERE sale_date BETWEEN ? AND ?'
        : '';

    const params: (Date | number)[] = startDate && endDate ? [startDate, endDate] : [];
    if (limit) params.push(limit);

    const rows = await executeQuery<any[]>(`
        SELECT p.id as productId, p.name as productName,
               SUM(ps.quantity_sold) as totalQuantitySold
        FROM products p
        LEFT JOIN product_sales ps ON p.id = ps.product_id
        ${dateFilter}
        GROUP BY p.id, p.name
        ORDER BY totalQuantitySold DESC
        LIMIT ?
    `, params);

    return rows.map(row => ({
        productId: row.productId,
        productName: row.productName,
        totalQuantitySold: Number(row.totalQuantitySold) || 0
    }));
}

export async function getTopSalesByQuantity(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<TopSaleByQuantity[]> {
    const dateFilter = startDate && endDate
        ? 'WHERE sale_date BETWEEN ? AND ?'
        : '';

    const params: (Date | number)[] = startDate && endDate ? [startDate, endDate] : [];
    if (limit) params.push(limit);

    const rows = await executeQuery<any[]>(`
        SELECT ps.id, p.name as productName, ps.quantity_sold as quantitySold,
               ps.sale_date as saleDate
        FROM product_sales ps
        JOIN products p ON ps.product_id = p.id
        ${dateFilter}
        ORDER BY ps.quantity_sold DESC
        LIMIT ?
    `, params);

    return rows.map(row => ({
        id: row.id,
        productName: row.productName,
        quantitySold: Number(row.quantitySold),
        saleDate: row.saleDate.toISOString()
    }));
}

export async function getProductRevenueSummary(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<ProductRevenueSummary[]> {
    const dateFilter = startDate && endDate
        ? 'WHERE sale_date BETWEEN ? AND ?'
        : '';

    const params: (Date | number)[] = startDate && endDate ? [startDate, endDate] : [];
    if (limit) params.push(limit);

    const rows = await executeQuery<any[]>(`
        SELECT p.id as productId, p.name as productName,
               SUM(ps.quantity_sold * p.price) as totalRevenue
        FROM products p
        LEFT JOIN product_sales ps ON p.id = ps.product_id
        ${dateFilter}
        GROUP BY p.id, p.name
        ORDER BY totalRevenue DESC
        LIMIT ?
    `, params);

    return rows.map(row => ({
        productId: row.productId,
        productName: row.productName,
        totalRevenue: Number(row.totalRevenue) || 0
    }));
}
