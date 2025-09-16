
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

    // Verify the file is valid before processing
    if (!data.imageFile || !(data.imageFile instanceof File)) {
        throw new Error('Invalid or missing image file');
    }
    
    console.log('Converting file to base64...');
    
    // Convert file to base64 instead of using FormData
    const arrayBuffer = await data.imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const requestData = {
        imageFile: {
            data: base64,
            name: data.imageFile.name,
            type: data.imageFile.type,
            size: data.imageFile.size
        },
        title: data.title || '',
        subtitle: data.subtitle || ''
    };

    console.log('Sending as JSON with base64 data, file size:', requestData.imageFile.size);

    const response = await fetch('/api/admin/banners', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
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
