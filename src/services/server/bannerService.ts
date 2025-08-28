import { executeQuery } from '@/lib/server/mysql';
import { uploadImageToServer } from '@/lib/server/imageStorage';
import type { Banner } from '@/types/banner';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

export interface AddBannerData {
    imageBuffer: Buffer;
    originalFilename: string;
    title?: string;
    subtitle?: string;
}

export async function getBanners(): Promise<Banner[]> {
    const banners = await executeQuery<any[]>(
        'SELECT * FROM banners ORDER BY created_at DESC'
    );
    
    return banners.map(banner => {
        // Ensure the path starts with a forward slash and doesn't have /admin/
        const imagePath = banner.image_path.startsWith('/') ? banner.image_path : `/${banner.image_path}`;
        const cleanPath = imagePath.replace(/^\/admin\//, '/');
        
        return {
            id: banner.id,
            imageUrl: cleanPath,
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            createdAt: banner.created_at.toISOString(),
            filePath: cleanPath
        };
    });
}

export async function addBanner(data: AddBannerData): Promise<Banner> {
    const id = uuidv4();
    const imagePath = await uploadImageToServer(
        data.imageBuffer,
        data.originalFilename,
        `banners/${id}`
    );
    
    const banner = await executeQuery<any[]>(
        'INSERT INTO banners (id, image_path, title, subtitle) VALUES (?, ?, ?, ?)',
        [id, imagePath.path, data.title, data.subtitle]
    );

    return {
        id,
        imageUrl: imagePath.path,
        title: data.title || '',
        subtitle: data.subtitle || '',
        createdAt: new Date().toISOString(),
        filePath: imagePath.path
    };
}

async function deleteImage(imagePath: string): Promise<void> {
    try {
        // Remove the leading slash and /uploads/ prefix if present
        const relativePath = imagePath.replace(/^\/+/, '').replace(/^uploads\//, '');
        const fullPath = path.join(process.cwd(), 'public', 'uploads', relativePath);
        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw here - we want to continue with banner deletion even if file deletion fails
    }
}

export async function deleteBanner(bannerId: string): Promise<void> {
    const [banner] = await executeQuery<any[]>(
        'SELECT image_path FROM banners WHERE id = ?',
        [bannerId]
    );

    if (banner && banner.image_path) {
        await deleteImage(banner.image_path);
    }

    await executeQuery(
        'DELETE FROM banners WHERE id = ?',
        [bannerId]
    );
}
