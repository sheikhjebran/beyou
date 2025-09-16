import { executeQuery } from '@/lib/server/mysql';
import type { CategoryImageData } from '@/types/categoryImage';

export async function getCategoryImage(categoryId: string): Promise<CategoryImageData | null> {
    try {
        const rows = await executeQuery<any[]>(
            'SELECT image_path, updated_at FROM category_images WHERE category_name = ?',
            [categoryId]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            imageUrl: row.image_path,
            updatedAt: row.updated_at.toISOString()
        };
    } catch (error) {
        console.error('Error fetching category image:', error);
        return null;
    }
}

export async function updateCategoryImage(categoryId: string, imagePath: string): Promise<void> {
    await executeQuery(
        `INSERT INTO category_images (id, category_name, image_path, updated_at) 
         VALUES (UUID(), ?, ?, NOW())
         ON DUPLICATE KEY UPDATE image_path = ?`,
        [categoryId, imagePath, imagePath]
    );
}

import { deleteImageFromServer } from '@/lib/server/imageStorage';

export async function deleteCategoryImage(categoryId: string): Promise<void> {
    // First get the image path
    const [categoryImage] = await executeQuery<any[]>(
        'SELECT image_path FROM category_images WHERE category_id = ?',
        [categoryId]
    );

    if (categoryImage && categoryImage.image_path) {
        await deleteImageFromServer(categoryImage.image_path);
    }

    await executeQuery(
        'DELETE FROM category_images WHERE category_id = ?',
        [categoryId]
    );
}
