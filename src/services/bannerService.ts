
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

export async function addAdminBanner(data: AddBannerData): Promise<Banner> {
    console.log('addAdminBanner called with:', {
        hasImageFile: !!data.imageFile,
        imageFileName: data.imageFile?.name,
        imageFileSize: data.imageFile?.size,
        imageFileType: data.imageFile?.type,
        title: data.title,
        subtitle: data.subtitle
    });

    const formData = new FormData();
    
    // Verify the file is valid before appending
    if (!data.imageFile || !(data.imageFile instanceof File)) {
        throw new Error('Invalid or missing image file');
    }
    
    console.log('Appending file to FormData:', {
        name: data.imageFile.name,
        size: data.imageFile.size,
        type: data.imageFile.type
    });
    
    formData.append('imageFile', data.imageFile);
    
    if (data.title) {
        console.log('Appending title:', data.title);
        formData.append('title', data.title);
    }
    if (data.subtitle) {
        console.log('Appending subtitle:', data.subtitle);
        formData.append('subtitle', data.subtitle);
    }

    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }

    console.log('FormData created, making request to /api/admin/banners');

    const response = await fetch('/api/admin/banners', {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return handleDatabaseResponse<Banner>(response);
}

export async function deleteAdminBanner(bannerId: string): Promise<void> {
    const response = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    return handleDatabaseResponse<void>(response);
}
