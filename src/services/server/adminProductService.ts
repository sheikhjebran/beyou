import { executeQuery } from '@/lib/server/mysql';
import { Product } from '@/types/product';

export async function getAdminProduct(id: string): Promise<Product | null> {
    try {
        const [product] = await executeQuery<any[]>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (!product) return null;

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock_quantity: product.stock_quantity,
            category: product.category,
            subcategory: product.subcategory,
            primary_image_path: product.primary_image_path,
            is_best_seller: Boolean(product.is_best_seller),
            created_at: product.created_at.toISOString(),
            updated_at: product.updated_at.toISOString()
        };
    } catch (error) {
        console.error('Error fetching admin product:', error);
        throw error;
    }
}

export async function updateAdminProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
        // Filter out undefined values and prepare update fields
        const updateFields = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        // Build the SQL update statement dynamically
        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);
        const updateQuery = `
            UPDATE products 
            SET ${fields.map(field => `${field} = ?`).join(', ')},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await executeQuery(updateQuery, [...values, id]);

        // Fetch and return the updated product
        const updatedProduct = await getAdminProduct(id);
        if (!updatedProduct) {
            throw new Error('Product not found after update');
        }

        return updatedProduct;
    } catch (error) {
        console.error('Error updating admin product:', error);
        throw error;
    }
}