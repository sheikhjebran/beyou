
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
        title: data.title,
        subtitle: data.subtitle
    });

    const formData = new FormData();
    formData.append('imageFile', data.imageFile);
    if (data.title) formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);

    console.log('FormData created, making request to /api/admin/banners');

    const response = await fetch('/api/admin/banners', {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    return handleDatabaseResponse<Banner>(response);
}

export async function deleteAdminBanner(bannerId: string): Promise<void> {
    const response = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    return handleDatabaseResponse<void>(response);
}
