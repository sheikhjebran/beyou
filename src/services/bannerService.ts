
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
    
    console.log('Converting file to base64 for alternative upload...');
    
    try {
        // Convert file to base64
        const arrayBuffer = await data.imageFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        console.log('Base64 conversion complete, length:', base64.length);
        
        // Method 1: Try URL-based upload for smaller files (< 8000 chars to stay under URL limits)
        if (base64.length < 8000) {
            console.log('Using URL-based upload method...');
            
            const params = new URLSearchParams({
                method: 'url_upload',
                data: base64,
                filename: data.imageFile.name,
                title: data.title || '',
                subtitle: data.subtitle || ''
            });
            
            const response = await fetch(`/api/admin/banners/alternative?${params.toString()}`, {
                method: 'POST',
                credentials: 'include',
            });
            
            console.log('URL upload response status:', response.status);
            
            if (response.ok) {
                console.log('URL upload successful!');
                return handleDatabaseResponse<Banner>(response);
            } else {
                const errorText = await response.text();
                console.error('URL upload failed:', errorText);
                throw new Error(`URL upload failed: ${response.status}`);
            }
        }
        
        // Method 2: Try chunk-based upload for larger files
        console.log('File too large for URL method, trying chunked upload...');
        
        // Split base64 into chunks
        const chunkSize = 4000; // Safe chunk size
        const chunks = [];
        for (let i = 0; i < base64.length; i += chunkSize) {
            chunks.push(base64.substring(i, i + chunkSize));
        }
        
        console.log(`Splitting into ${chunks.length} chunks`);
        
        // For now, let's try a simpler approach - use the alternative endpoint with POST body
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
        
        console.log('Trying alternative endpoint with POST body...');
        
        const response = await fetch('/api/admin/banners/alternative', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        
        console.log('Alternative endpoint response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Alternative endpoint failed:', errorText);
            throw new Error(`Alternative upload failed: ${response.status} - ${errorText}`);
        }
        
        return handleDatabaseResponse<Banner>(response);
        
    } catch (error) {
        console.error('All upload methods failed:', error);
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
