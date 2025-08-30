import connection from '@/lib/server/mysql';
import { unlink } from 'fs/promises';
import path from 'path';

export async function deleteProductImage(productId: string, imagePath: string): Promise<{ success: boolean, error?: string }> {
    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();

        // First check if this is a primary image
        const [product] = await conn.query(
            'SELECT primary_image_path FROM products WHERE id = ?',
            [productId]
        ) as [any[], any];

        if (!product.length) {
            throw new Error('Product not found');
        }

        // Don't allow deleting primary image
        if (product[0].primary_image_path === imagePath) {
            return {
                success: false,
                error: 'Cannot delete primary image. Please set another image as primary first.'
            };
        }

        // Delete from database first
        await conn.query(
            'DELETE FROM product_images WHERE product_id = ? AND image_path = ?',
            [productId, imagePath]
        );

        // Try to delete the actual file
        try {
            const absolutePath = path.join(process.cwd(), 'public', imagePath);
            await unlink(absolutePath);
        } catch (err) {
            console.warn('File deletion failed, but database updated:', err);
        }

        await conn.commit();
        return { success: true };
    } catch (error) {
        await conn.rollback();
        console.error('Error deleting product image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete image'
        };
    } finally {
        conn.release();
    }
}

export async function setPrimaryProductImage(productId: string, imagePath: string): Promise<{ success: boolean, error?: string }> {
    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();

        // Verify the image exists for this product
        const [imageExists] = await conn.query(
            'SELECT 1 FROM product_images WHERE product_id = ? AND image_path = ?',
            [productId, imagePath]
        ) as [any[], any];

        if (!imageExists.length) {
            throw new Error('Image not found for this product');
        }

        // Update primary image in products table
        await conn.query(
            'UPDATE products SET primary_image_path = ? WHERE id = ?',
            [imagePath, productId]
        );

        // Update is_primary flags in product_images table
        await conn.query(
            'UPDATE product_images SET is_primary = CASE WHEN image_path = ? THEN 1 ELSE 0 END WHERE product_id = ?',
            [imagePath, productId]
        );

        await conn.commit();
        return { success: true };
    } catch (error) {
        await conn.rollback();
        console.error('Error setting primary image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to set primary image'
        };
    } finally {
        conn.release();
    }
}
