import pool from '@/lib/server/mysql';
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
    quantity: number;
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

// Type for a sale record
export type SaleRecord = {
    id?: string;
    productId: string;
    productName: string;
    quantitySold: number;
    salePricePerUnit: number;
    totalSaleAmount: number;
    saleTimestamp: Date;
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
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_path) as image_paths,
                   (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        `);

        return (rows as any[]).map(row => ({
            id: row.id,
            name: row.name || 'Unnamed Product',
            category: row.category || 'Other',
            subcategory: row.sub_category || 'Miscellaneous',
            description: row.description || 'No description available.',
            price: Number(row.price) || 0,
            primary_image_path: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
            image_paths: row.image_paths ? row.image_paths.split(',') : [],
            stock_quantity: Number(row.quantity) || 0,
            is_best_seller: Boolean(row.is_best_seller),
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        }));
    } catch (error) {
        console.warn("Warning during fetching products:", error);
        return [];
    } finally {
        connection.release();
    }
}

export async function getBestSellingProducts(): Promise<Product[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_path) as image_paths,
                   (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.is_best_seller = true
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        `);

        return (rows as any[]).map(row => ({
            id: row.id,
            name: row.name || 'Unnamed Product',
            category: row.category || 'Other',
            subcategory: row.sub_category || 'Miscellaneous',
            description: row.description || 'No description available.',
            price: Number(row.price) || 0,
            primary_image_path: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
            image_paths: row.image_paths ? row.image_paths.split(',') : [],
            stock_quantity: Number(row.quantity) || 0,
            is_best_seller: true,
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        }));
    } catch (error) {
        console.warn("Warning during fetching best selling products:", error);
        return [];
    } finally {
        connection.release();
    }
}

export async function getMostRecentProduct(): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_path) as image_paths,
                   (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 1
        `);

        if ((rows as any[]).length === 0) {
            return null;
        }

        const row = (rows as any[])[0];
        return {
            id: row.id,
            name: row.name || 'Unnamed Product',
            category: row.category || 'Other',
            subcategory: row.sub_category || 'Miscellaneous',
            description: row.description || 'No description available.',
            price: Number(row.price) || 0,
            primary_image_path: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
            image_paths: row.image_paths ? row.image_paths.split(',') : [],
            stock_quantity: Number(row.quantity) || 0,
            is_best_seller: Boolean(row.is_best_seller),
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        };
    } catch (error) {
        console.warn("Warning during fetching the most recent product:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function getProductById(productId: string): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.image_path) as image_paths,
                   (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
            GROUP BY p.id
        `, [productId]);

        if ((rows as any[]).length === 0) {
            return null;
        }

        const row = (rows as any[])[0];
        return {
            id: row.id,
            name: row.name || 'Unnamed Product',
            category: row.category || 'Other',
            subcategory: row.sub_category || 'Miscellaneous',
            description: row.description || 'No description available.',
            price: Number(row.price) || 0,
            primary_image_path: row.primary_image || DEFAULT_PRIMARY_IMAGE_URL,
            image_paths: row.image_paths ? row.image_paths.split(',') : [],
            stock_quantity: Number(row.quantity) || 0,
            is_best_seller: Boolean(row.is_best_seller),
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
        };
    } catch (error) {
        console.warn(`Warning during fetching product with ID ${productId}:`, error);
        return null;
    } finally {
        connection.release();
    }
}

export async function addProduct(productData: AddProductData): Promise<string> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert product
        const [result] = await connection.query(`
            INSERT INTO products (
                name, category, sub_category, description, price, 
                quantity, is_best_seller, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            productData.name,
            productData.category,
            productData.subCategory,
            productData.description,
            productData.price,
            productData.quantity,
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
        console.error('Error adding product:', error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateProduct(productId: string, productData: UpdateProductData): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update product details
        await connection.query(`
            UPDATE products 
            SET name = ?, 
                category = ?,
                sub_category = ?,
                description = ?,
                price = ?,
                quantity = ?,
                updated_at = NOW()
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
            if (productData.imageUpdateData.imageFiles === null) {
                // Remove all existing images
                await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
            } else if (productData.imageUpdateData.imageFiles?.length) {
                // Remove existing images first
                await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
                
                // Add new images
                for (let i = 0; i < productData.imageUpdateData.imageFiles.length; i++) {
                    const isPrimary = productData.imageUpdateData.newPrimaryImageIndexForUpload === i;
                    await connection.query(`
                        INSERT INTO product_images (
                            product_id, image_path, is_primary, created_at, updated_at
                        ) VALUES (?, ?, ?, NOW(), NOW())
                    `, [
                        productId,
                        productData.imageUpdateData.imageFiles[i].name,
                        isPrimary
                    ]);
                }
            } else if (productData.imageUpdateData.makeExistingImagePrimary) {
                // Update primary status for existing images
                await connection.query('UPDATE product_images SET is_primary = false WHERE product_id = ?', [productId]);
                await connection.query(`
                    UPDATE product_images 
                    SET is_primary = true 
                    WHERE product_id = ? AND image_path = ?
                `, [productId, productData.imageUpdateData.makeExistingImagePrimary]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(`Error updating product ${productId}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteProduct(productId: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Delete product images
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
        // Delete the product
        await connection.query('DELETE FROM products WHERE id = ?', [productId]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(`Error deleting product ${productId}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateProductBestSellerStatus(productId: string, isBestSeller: boolean): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE products 
            SET is_best_seller = ?, updated_at = NOW()
            WHERE id = ?
        `, [isBestSeller, productId]);
    } catch (error) {
        console.error(`Error updating best seller status for product ${productId}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function recordSaleAndUpdateStock(productId: string, quantitySold: number): Promise<void> {
    if (quantitySold <= 0) {
        throw new Error("Quantity sold must be a positive number.");
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get product details
        const [products] = await connection.query(
            'SELECT name, quantity, price FROM products WHERE id = ? FOR UPDATE',
            [productId]
        );

        if ((products as any[]).length === 0) {
            throw new Error("Product not found.");
        }

        const product = (products as any[])[0];
        if (product.quantity < quantitySold) {
            throw new Error(`Insufficient stock. Only ${product.quantity} available.`);
        }

        // Update product quantity
        await connection.query(
            'UPDATE products SET quantity = quantity - ?, updated_at = NOW() WHERE id = ?',
            [quantitySold, productId]
        );

        // Record sale
        const totalAmount = product.price * quantitySold;
        await connection.query(
            `INSERT INTO sales (product_id, product_name, quantity_sold, sale_price_per_unit, 
             total_sale_amount, sale_timestamp)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [productId, product.name, quantitySold, product.price, totalAmount]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(`Error recording sale for product ${productId}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}

export async function getTodaysSalesSummary(): Promise<TodaysSalesSummary> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT COUNT(*) as orders_count, COALESCE(SUM(total_sale_amount), 0) as total_amount
            FROM sales
            WHERE DATE(sale_timestamp) = CURDATE()
        `);

        const result = (rows as any[])[0];
        return {
            ordersToday: result.orders_count,
            salesTodayAmount: result.total_amount
        };
    } catch (error) {
        console.warn("Warning fetching today's sales summary:", error);
        return { ordersToday: 0, salesTodayAmount: 0 };
    } finally {
        connection.release();
    }
}

export async function getProductSalesSummary(
    limitCount: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<ProductSaleSummary[]> {
    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                product_id,
                product_name,
                SUM(quantity_sold) as total_quantity
            FROM sales
            WHERE 1=1
        `;
        const params: any[] = [];

        if (startDate) {
            query += ` AND DATE(sale_timestamp) >= DATE(?)`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND DATE(sale_timestamp) <= DATE(?)`;
            params.push(endDate);
        }

        query += `
            GROUP BY product_id, product_name
            ORDER BY total_quantity DESC
            LIMIT ?
        `;
        params.push(limitCount);

        const [rows] = await connection.query(query, params);
        
        return (rows as any[]).map(row => ({
            productId: row.product_id,
            productName: row.product_name,
            totalQuantitySold: row.total_quantity
        }));
    } catch (error) {
        console.warn("Warning fetching product sales summary:", error);
        return [];
    } finally {
        connection.release();
    }
}

export async function getTopSalesByQuantity(
    limitCount: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<TopSaleByQuantity[]> {
    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                id,
                product_name,
                quantity_sold,
                DATE_FORMAT(sale_timestamp, '%Y-%m-%d') as sale_date
            FROM sales
            WHERE 1=1
        `;
        const params: any[] = [];

        if (startDate) {
            query += ` AND DATE(sale_timestamp) >= DATE(?)`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND DATE(sale_timestamp) <= DATE(?)`;
            params.push(endDate);
        }

        query += `
            ORDER BY quantity_sold DESC
            LIMIT ?
        `;
        params.push(limitCount);

        const [rows] = await connection.query(query, params);
        
        return (rows as any[]).map(row => ({
            id: row.id,
            productName: row.product_name,
            quantitySold: row.quantity_sold,
            saleDate: row.sale_date
        }));
    } catch (error) {
        console.warn("Warning fetching top sales by quantity:", error);
        return [];
    } finally {
        connection.release();
    }
}

export async function getProductRevenueSummary(
    limitCount: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<ProductRevenueSummary[]> {
    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                product_id,
                product_name,
                SUM(total_sale_amount) as total_revenue
            FROM sales
            WHERE 1=1
        `;
        const params: any[] = [];

        if (startDate) {
            query += ` AND DATE(sale_timestamp) >= DATE(?)`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND DATE(sale_timestamp) <= DATE(?)`;
            params.push(endDate);
        }

        query += `
            GROUP BY product_id, product_name
            ORDER BY total_revenue DESC
            LIMIT ?
        `;
        params.push(limitCount);

        const [rows] = await connection.query(query, params);
        
        return (rows as any[]).map(row => ({
            productId: row.product_id,
            productName: row.product_name,
            totalRevenue: row.total_revenue
        }));
    } catch (error) {
        console.warn("Warning fetching product revenue summary:", error);
        return [];
    } finally {
        connection.release();
    }
}
