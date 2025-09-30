import pool, { executeQuery } from '@/lib/server/mysql';
import { Product } from '@/types/product';
import { saveFile, deleteFile } from '@/lib/fileUpload';
import { v4 as uuidv4 } from 'uuid';

export async function getMostRecentProduct() {
    try {
        const [rows] = await executeQuery(
            'SELECT * FROM products ORDER BY created_at DESC LIMIT 1'
        ) as [any[], any];
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error getting most recent product:', error);
        throw error;
    }
}

export async function getTodaysSalesSummary() {
    try {
        const [rows] = await executeQuery(`
            SELECT 
                COUNT(*) as total_sales,
                SUM(total_amount) as total_revenue,
                SUM(quantity_sold) as items_sold
            FROM sales 
            WHERE DATE(sale_date) = CURDATE()
        `) as [any[], any];
        
        return {
            totalSales: rows[0].total_sales || 0,
            totalRevenue: rows[0].total_revenue || 0,
            itemsSold: rows[0].items_sold || 0
        };
    } catch (error) {
        console.error('Error getting today\'s sales summary:', error);
        throw error;
    }
}

// Constants
const DEFAULT_PRIMARY_IMAGE_URL = '/images/placeholder.png';

// Types
type ImageInfo = { path: string; isPrimary: boolean };
const formatPath = (path: string | null): string => {
    if (!path) return DEFAULT_PRIMARY_IMAGE_URL;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Normalize backslashes to forward slashes for URLs
    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/?(uploads\/)?/, '');
    return `/uploads/${normalizedPath}`;
};

const sanitizeJsonString = (str: string | null): string | null => {
    if (!str) return null;
    const trimmed = str.trim();
    if (!trimmed) return null;
    
    // Normalize backslashes to forward slashes for URLs before JSON parsing
    const normalizedStr = trimmed.replace(/\\/g, '/');
    
    return normalizedStr.startsWith('[') ? normalizedStr : `[${normalizedStr}]`;
};

// Image Processing Functions (Depends on Base Utilities)
const parseJsonToImages = (jsonString: string | null): ImageInfo[] => {
    const validJson = sanitizeJsonString(jsonString);
    if (!validJson) return [];
    
    try {
        const parsed = JSON.parse(validJson) as ImageInfo[];
        return Array.isArray(parsed) ? 
            parsed.filter(img => img && typeof img.path === 'string') : 
            [];
    } catch (error) {
        console.error('Error parsing image JSON:', error);
        return [];
    }
};

const formatImagePaths = (images: ImageInfo[]): string[] => {
    return images.map(img => formatPath(img.path));
};

// Main Image Data Processing (Depends on All Above)
const getImageData = (imageString: string | null, primaryImagePath?: string | null): { primary_image_path: string; image_paths: string[] } => {
    console.log('Getting image data:', { imageString, primaryImagePath });
    
    const images = parseJsonToImages(imageString);
    console.log('Parsed images:', images);

    // If we have a primary_image_path from the database, use it
    if (primaryImagePath) {
        const primary = formatPath(primaryImagePath);
        const allPaths = formatImagePaths(images);
        
        // Ensure primary image is first in the array
        const uniqueUrls = Array.from(new Set([primary, ...allPaths]));
        return {
            primary_image_path: primary,
            image_paths: uniqueUrls
        };
    }

    // If we have images but no primary_image_path
    if (images.length > 0) {
        const primaryImage = images.find(img => img.isPrimary) || images[0];
        const allPaths = formatImagePaths(images);
        
        return {
            primary_image_path: formatPath(primaryImage.path),
            image_paths: allPaths
        };
    }

    // Fallback to default image
    return {
        primary_image_path: DEFAULT_PRIMARY_IMAGE_URL,
        image_paths: [DEFAULT_PRIMARY_IMAGE_URL]
    };
};

// Database Functions
// Types for pagination
export type PaginatedProducts = {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export async function getProducts(page: number = 1, pageSize: number = 10, filters?: {
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    isBestSeller?: boolean;
    search?: string;
}): Promise<PaginatedProducts> {
    const connection = await pool.getConnection();
    try {
        // Calculate offset
        const offset = (page - 1) * pageSize;

        // Build WHERE clause based on filters
        const whereConditions: string[] = [];
        const whereParams: any[] = [];
        
        if (filters) {
            if (filters.category) {
                whereConditions.push('p.category = ?');
                whereParams.push(filters.category);
            }
            if (filters.subCategory) {
                whereConditions.push('p.subcategory = ?');
                whereParams.push(filters.subCategory);
            }
            if (filters.minPrice !== undefined) {
                whereConditions.push('p.price >= ?');
                whereParams.push(filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                whereConditions.push('p.price <= ?');
                whereParams.push(filters.maxPrice);
            }
            if (filters.isBestSeller !== undefined) {
                whereConditions.push('p.is_best_seller = ?');
                whereParams.push(filters.isBestSeller);
            }
            if (filters.search) {
                whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.subcategory LIKE ?)');
                const searchPattern = `%${filters.search}%`;
                whereParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
            }
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count for pagination
        const [countResult] = await connection.query(
            `SELECT COUNT(DISTINCT p.id) as total 
             FROM products p 
             ${whereClause}`,
            whereParams
        ) as [any[], any];

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / pageSize);

        // Get paginated products with images
        const queryParams = [...whereParams, offset, pageSize];
        const [rows] = await connection.query(`
            SELECT 
                p.*,
                p.primary_image_path,
                CONCAT(
                    '[',
                    GROUP_CONCAT(
                        CONCAT('{"path":"', TRIM(pi.image_path), '","isPrimary":', IF(pi.is_primary, 'true', 'false'), '}')
                        ORDER BY pi.is_primary DESC, pi.created_at ASC
                        SEPARATOR ','
                    ),
                    ']'
                ) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            ${whereClause}
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT ?, ?
        `, queryParams) as [any[], any];

        const products = rows.map(row => {
            const { primary_image_path, image_paths } = getImageData(row.images, row.primary_image_path);
            
            return {
                id: row.id,
                name: row.name,
                category: row.category,
                subcategory: row.subcategory || '',
                description: row.description,
                price: Number(row.price),
                stock_quantity: Number(row.stock_quantity) || 0,
                is_best_seller: Boolean(row.is_best_seller),
                primary_image_path: primary_image_path,
                image_paths: image_paths,
                created_at: row.created_at ? row.created_at.toISOString() : null,
                updated_at: row.updated_at ? row.updated_at.toISOString() : null
            };
        });

        return {
            products,
            total,
            page,
            pageSize,
            totalPages
        };
    } catch (error) {
        console.warn("Warning during fetching products:", error);
        return {
            products: [],
            total: 0,
            page: 1,
            pageSize,
            totalPages: 0
        };
    } finally {
        connection.release();
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT 
                p.*,
                p.primary_image_path,
                CONCAT(
                    '[',
                    GROUP_CONCAT(
                        CONCAT('{"path":"', TRIM(pi.image_path), '","isPrimary":', IF(pi.is_primary, 'true', 'false'), '}')
                        ORDER BY pi.is_primary DESC, pi.created_at ASC
                        SEPARATOR ','
                    ),
                    ']'
                ) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]) as [any[], any];

        if (!rows.length) return null;

        const row = rows[0];
        const { primary_image_path, image_paths } = getImageData(row.images, row.primary_image_path);

        return {
            id: row.id,
            name: row.name,
            category: row.category,
            subcategory: row.subcategory || '',
            description: row.description,
            price: Number(row.price),
            stock_quantity: Number(row.stock_quantity) || 0,
            is_best_seller: Boolean(row.is_best_seller),
            primary_image_path: primary_image_path,
            image_paths: image_paths,
            created_at: row.created_at ? row.created_at.toISOString() : null,
            updated_at: row.updated_at ? row.updated_at.toISOString() : null
        };
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const productId = uuidv4(); // Generate UUID for product

        // Log the product insert query
        const productQuery = `
            INSERT INTO products (
                id,
                name, 
                category, 
                subcategory,
                description, 
                price, 
                stock_quantity,
                is_best_seller,
                primary_image_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const productValues = [
            productId,
            product.name,
            product.category,
            product.subcategory,
            product.description,
            product.price,
            product.stock_quantity,
            product.is_best_seller ? 1 : 0,
            product.primary_image_path
        ];
        
        console.log('Product Insert Query:', productQuery);
        console.log('Product Insert Values:', JSON.stringify(productValues, null, 2));
        
        await connection.query(productQuery, productValues);

        // Insert image records
        if (product.image_paths && product.image_paths.length > 0) {
            // Filter out any invalid paths
            const validImagePaths = product.image_paths.filter(path => path && path.trim());
            
            if (validImagePaths.length > 0) {
                const imageValues = validImagePaths.map((path) => [
                    uuidv4(), // Generate UUID for each image
                    productId,
                    path.trim(),
                    path.trim() === product.primary_image_path?.trim() ? 1 : 0, // is_primary as tinyint
                    new Date(),
                    new Date()
                ]);

                const imagesQuery = `
                    INSERT INTO product_images (
                        id,
                        product_id,
                        image_path,
                        is_primary,
                        created_at,
                        updated_at
                    ) VALUES ?
                `;
                
                console.log('Images Insert Query:', imagesQuery);
                console.log('Images Insert Values:', JSON.stringify(imageValues, null, 2));
                
                await connection.query(imagesQuery, [imageValues]);
            }
        }

        await connection.commit();
        return await getProductById(productId);
    } catch (error) {
        await connection.rollback();
        console.error("Error adding product:", error);
        return null;
    } finally {
        connection.release();
    }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update product table
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (updates.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(updates.name);
        }
        if (updates.category !== undefined) {
            updateFields.push('category = ?');
            updateValues.push(updates.category);
        }
        if (updates.subcategory !== undefined) {
            updateFields.push('subcategory = ?');
            updateValues.push(updates.subcategory);
        }
        if (updates.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(updates.description);
        }
        if (updates.price !== undefined) {
            updateFields.push('price = ?');
            updateValues.push(updates.price);
        }
        if (updates.stock_quantity !== undefined) {
            updateFields.push('stock_quantity = ?');
            updateValues.push(updates.stock_quantity);
        }
        if (updates.is_best_seller !== undefined) {
            updateFields.push('is_best_seller = ?');
            updateValues.push(updates.is_best_seller ? 1 : 0);
        }
        if (updates.primary_image_path !== undefined) {
            updateFields.push('primary_image_path = ?');
            updateValues.push(updates.primary_image_path);
        }

        if (updateFields.length > 0) {
            updateFields.push('updated_at = NOW()');
            await connection.query(`
                UPDATE products 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, [...updateValues, id]);
        }

        // Update images if provided
        if (updates.image_paths) {
            // Delete existing images
            await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);

            // Insert new images
            const imageValues = updates.image_paths.map((path) => [
                uuidv4(), // Generate UUID for each image
                id,
                path,
                path === updates.primary_image_path ? 1 : 0, // is_primary as tinyint
                new Date(),
                new Date()
            ]);

            await connection.query(`
                INSERT INTO product_images (
                    id,
                    product_id,
                    image_path,
                    is_primary,
                    created_at,
                    updated_at
                ) VALUES ?
            `, [imageValues]);
        }

        await connection.commit();
        return await getProductById(id);
    } catch (error) {
        await connection.rollback();
        console.error("Error updating product:", error);
        return null;
    } finally {
        connection.release();
    }
}

import { deleteImageFromServer } from '@/lib/server/imageStorage';

export async function deleteProduct(id: string): Promise<boolean> {
    console.log('Server deleteProduct called with ID:', id);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log('Transaction started for product deletion');

        // First, check if product exists and get image paths
        const [product] = await connection.query('SELECT id, name FROM products WHERE id = ?', [id]) as any;
        console.log('Product lookup result:', product);
        
        if (product.length === 0) {
            console.log('Product not found with ID:', id);
            await connection.rollback();
            return false;
        }

        console.log('Found product to delete:', product[0].name);

        // Get all image paths before deleting from database
        const [images] = await connection.query('SELECT image_path FROM product_images WHERE product_id = ?', [id]) as any;
        
        // Delete images from storage
        for (const image of images) {
            if (image.image_path) {
                const deleteResult = await deleteImageFromServer(image.image_path);
                if (!deleteResult.success) {
                    console.error(`Failed to delete file ${image.image_path}:`, deleteResult.error);
                    // Continue with deletion even if file removal fails
                }
            }
        }

        // Delete related images from database
        console.log('Deleting product images from database...');
        const [imageDeleteResult] = await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]) as any;
        console.log('Deleted', imageDeleteResult.affectedRows, 'product images');

        // Delete the product
        console.log('Deleting product from products table...');
        const [result] = await connection.query('DELETE FROM products WHERE id = ?', [id]) as any;
        console.log('Product delete result:', result);
        console.log('Affected rows:', result.affectedRows);

        await connection.commit();
        console.log('Transaction committed successfully');
        
        const success = result.affectedRows > 0;
        console.log('Delete operation success:', success);
        return success;
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting product:", error);
        return false;
    } finally {
        connection.release();
        console.log('Database connection released');
    }
}
