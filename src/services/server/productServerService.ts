import { executeQuery } from '@/lib/server/mysql';
import { Product } from '@/types/product';
import { getImageUrl } from '@/lib/imageUtils';

export async function getProductById(productId: string): Promise<Product | null> {
    try {
        const rows = await executeQuery<any[]>(`
            SELECT p.*, 
                GROUP_CONCAT(pi.image_path) as image_paths,
                (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ?
            GROUP BY p.id
        `, [productId]);

        if (!rows || rows.length === 0) {
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
            primaryImageUrl: row.primary_image ? getImageUrl(row.primary_image) : '/images/placeholder.png',
            imageUrls: row.image_paths ? row.image_paths.split(',').filter(Boolean).map(getImageUrl) : [],
            stockQuantity: Number(row.stock_quantity) || 0,
            isBestSeller: Boolean(row.is_best_seller),
            createdAt: row.created_at ? row.created_at.toISOString() : null,
            updatedAt: row.updated_at ? row.updated_at.toISOString() : null
        };
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
}
