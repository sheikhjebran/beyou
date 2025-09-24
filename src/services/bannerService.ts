
'use client';

import { handleDatabaseResponse } from '@/lib/mysql';
import type { Banner, AddBannerData } from '@/types/banner';

// Re-export types for client use
export type { AddBannerData };

// Public endpoints
export async function getBanners(): Promise<Banner[]> {
    const response = await fetch('/api/banners');
    return handleDatabaseResponse<Banner[]>(response);
}

// Admin endpoints
// Aliases for backward compatibility
export const addBanner = addAdminBanner;
export const deleteBanner = deleteAdminBanner;

export async function getAdminBanners(): Promise<Banner[]> {
    const response = await fetch('/api/admin/banners', {
        credentials: 'include' // Important for sending admin cookies
    });
    return handleDatabaseResponse<Banner[]>(response);
}

export type ProgressCallback = (progress: number, status: string) => void;

export async function addAdminBannerWithProgress(data: AddBannerData, onProgress?: ProgressCallback): Promise<Banner> {
    console.log('addAdminBannerWithProgress called with:', {
        hasImageFile: !!data.imageFile,
        imageFileName: data.imageFile?.name,
        imageFileSize: data.imageFile?.size,
        imageFileType: data.imageFile?.type,
        title: data.title,
        subtitle: data.subtitle
    });

    // Call the main addAdminBanner function with progress tracking
    return addAdminBanner(data, onProgress);
}

export async function addAdminBanner(data: AddBannerData, onProgress?: ProgressCallback): Promise<Banner> {
    console.log('addAdminBanner called with:', {
        hasImageFile: !!data.imageFile,
        imageFileName: data.imageFile?.name,
        imageFileSize: data.imageFile?.size,
        imageFileType: data.imageFile?.type,
        title: data.title,
        subtitle: data.subtitle
    });

    // Verify the file is valid before processing
    if (!data.imageFile || !(data.imageFile instanceof File)) {
        throw new Error('Invalid or missing image file');
    }
    
    onProgress?.(5, 'Preparing file upload...');
    
    try {
        // Use standard FormData approach - this is the most reliable method
        const formData = new FormData();
        formData.append('imageFile', data.imageFile);
        formData.append('title', data.title || '');
        formData.append('subtitle', data.subtitle || '');
        
        onProgress?.(20, 'Uploading file...');
        console.log('Using standard FormData upload to /api/admin/banners');
        
        const response = await fetch('/api/admin/banners', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        });
        
        console.log('Upload response status:', response.status);
        
        if (response.ok) {
            onProgress?.(100, 'Upload completed successfully!');
            console.log('Standard upload successful!');
            return handleDatabaseResponse<Banner>(response);
        } else {
            const errorText = await response.text();
            console.error('Standard upload failed:', errorText);
            throw new Error(`Upload failed: ${response.status} - ${errorText || response.statusText}`);
        }
        
    } catch (error) {
        onProgress?.(0, 'Upload failed');
        console.error('Upload failed:', error);
        throw error;
    }
}

export async function deleteAdminBanner(bannerId: string): Promise<void> {
    const response = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    return handleDatabaseResponse<void>(response);
}
