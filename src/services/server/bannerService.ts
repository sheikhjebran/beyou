import { executeQuery } from '@/lib/server/mysql';
import { saveUploadedFile } from '@/lib/server/imageOperations';
import type { Banner } from '@/types/banner';
import { v4 as uuidv4 } from 'uuid';

export interface AddBannerData {
    imageBuffer: Buffer;
    originalFilename: string;
    title?: string;
    subtitle?: string;
}

export async function getBanners(): Promise<Banner[]> {
    try {
        console.log('Fetching banners from database...');
        const banners = await executeQuery<any[]>(
            'SELECT * FROM banners ORDER BY created_at DESC'
        );
        
        console.log(`Found ${banners.length} banners`);
        
        return banners.map(banner => {
            // Ensure the path starts with a forward slash and doesn't have /admin/
            const imagePath = banner.image_path?.startsWith('/') 
                ? banner.image_path 
                : `/${banner.image_path || ''}`;
            
            const cleanPath = imagePath.replace(/^\/admin\//, '/');
            
            console.log('Processing banner:', {
                id: banner.id,
                originalPath: banner.image_path,
                cleanPath: cleanPath
            });
            
            return {
                id: banner.id,
                imageUrl: cleanPath,
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                createdAt: banner.created_at.toISOString(),
                filePath: cleanPath
            };
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        throw error;
    }
}

export async function addBanner(data: AddBannerData): Promise<Banner> {
    const id = uuidv4();
    
    // Use the new image operations system that handles both local and production paths
    const uploadResult = await saveUploadedFile(
        data.imageBuffer,
        data.originalFilename,
        'banners'
    );
    
    const banner = await executeQuery<any[]>(
        'INSERT INTO banners (id, image_path, title, subtitle) VALUES (?, ?, ?, ?)',
        [id, uploadResult.path, data.title, data.subtitle]
    );

    return {
        id,
        imageUrl: uploadResult.path,
        title: data.title || '',
        subtitle: data.subtitle || '',
        createdAt: new Date().toISOString(),
        filePath: uploadResult.path
    };
}

import { deleteUploadedFile } from '@/lib/server/imageOperations';

export async function deleteBanner(bannerId: string): Promise<void> {
    const [banner] = await executeQuery<any[]>(
        'SELECT image_path FROM banners WHERE id = ?',
        [bannerId]
    );

    if (banner && banner.image_path) {
        await deleteUploadedFile(banner.image_path);
    }

    await executeQuery(
        'DELETE FROM banners WHERE id = ?',
        [bannerId]
    );
}
