
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

    // Verify the file is valid before processing
    if (!data.imageFile || !(data.imageFile instanceof File)) {
        throw new Error('Invalid or missing image file');
    }
    
    onProgress?.(5, 'Converting file to base64...');
    console.log('Converting file to base64 for alternative upload...');
    
    try {
        // Convert file to base64
        const arrayBuffer = await data.imageFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        onProgress?.(10, 'File conversion complete');
        console.log('Base64 conversion complete, length:', base64.length);
        
        // Method 1: Try URL-based upload for smaller files (< 4000 chars to avoid 431 error)
        if (base64.length < 4000) {
            onProgress?.(20, 'Using URL-based upload method...');
            console.log('Using URL-based upload method...');
            
            const params = new URLSearchParams({
                method: 'url_upload',
                data: base64,
                filename: data.imageFile.name,
                title: data.title || '',
                subtitle: data.subtitle || ''
            });
            
            onProgress?.(60, 'Uploading file...');
            const response = await fetch(`/api/admin/banners/alternative?${params.toString()}`, {
                method: 'POST',
                credentials: 'include',
            });
            
            console.log('URL upload response status:', response.status);
            console.log('URL upload response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                onProgress?.(100, 'Upload completed successfully!');
                console.log('URL upload successful!');
                return handleDatabaseResponse<Banner>(response);
            } else {
                const errorText = await response.text();
                console.error('URL upload failed:', errorText);
                console.error('Response details:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                throw new Error(`URL upload failed: ${response.status} - ${errorText || response.statusText}`);
            }
        }
        
        // Method 2: Try chunked upload with query parameters for larger files
        onProgress?.(15, 'File too large for URL method, preparing chunked upload...');
        console.log('File too large for URL method, trying chunked upload with query params...');
        
        // Generate session ID
        const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Split base64 into smaller chunks (2KB each to be safe with URL limits)
        const chunkSize = 2000;
        const chunks = [];
        for (let i = 0; i < base64.length; i += chunkSize) {
            chunks.push(base64.substring(i, i + chunkSize));
        }
        
        onProgress?.(20, `Splitting into ${chunks.length} chunks...`);
        console.log(`Splitting into ${chunks.length} chunks for session ${sessionId}`);
        
        // Upload chunks sequentially using query parameters
        for (let i = 0; i < chunks.length; i++) {
            const progressPercent = 20 + ((i / chunks.length) * 70); // Progress from 20% to 90%
            onProgress?.(progressPercent, `Uploading chunk ${i + 1}/${chunks.length}...`);
            console.log(`Uploading chunk ${i + 1}/${chunks.length} via query params...`);
            
            const params = new URLSearchParams({
                sessionId,
                chunkIndex: i.toString(),
                chunkData: chunks[i],
                totalChunks: chunks.length.toString(),
                filename: data.imageFile.name,
                title: data.title || '',
                subtitle: data.subtitle || ''
            });
            
            console.log(`Chunk ${i + 1} query params length:`, params.toString().length);
            
            const response = await fetch(`/api/admin/banners/chunked-query?${params.toString()}`, {
                method: 'POST',
                credentials: 'include',
            });
            
            console.log(`Chunk ${i + 1} response status:`, response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Chunk ${i + 1} upload failed:`, errorText);
                throw new Error(`Chunk upload failed: ${response.status} - ${errorText}`);
            }
            
            // If this is the last chunk, we should get the banner response
            if (i === chunks.length - 1) {
                onProgress?.(95, 'Processing final response...');
                console.log('Final chunk uploaded, processing response...');
                const result = await handleDatabaseResponse<Banner>(response);
                onProgress?.(100, 'Upload completed successfully!');
                return result;
            } else {
                // For intermediate chunks, just log the response
                const chunkResponse = await response.json();
                console.log(`Chunk ${i + 1} response:`, chunkResponse);
            }
        }
        
        throw new Error('Chunked upload completed but no banner returned');
        
    } catch (error) {
        onProgress?.(0, 'Upload failed');
        console.error('All upload methods failed:', error);
        throw error;
    }
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
        
        // Method 1: Try URL-based upload for smaller files (< 4000 chars to avoid 431 error)
        if (base64.length < 4000) {
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
            console.log('URL upload response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                console.log('URL upload successful!');
                return handleDatabaseResponse<Banner>(response);
            } else {
                const errorText = await response.text();
                console.error('URL upload failed:', errorText);
                console.error('Response details:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                throw new Error(`URL upload failed: ${response.status} - ${errorText || response.statusText}`);
            }
        }
        
        // Method 2: Try chunked upload with query parameters for larger files
        console.log('File too large for URL method, trying chunked upload with query params...');
        
        // Generate session ID
        const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Split base64 into smaller chunks (2KB each to be safe with URL limits)
        const chunkSize = 2000;
        const chunks = [];
        for (let i = 0; i < base64.length; i += chunkSize) {
            chunks.push(base64.substring(i, i + chunkSize));
        }
        
        console.log(`Splitting into ${chunks.length} chunks for session ${sessionId}`);
        
        // Upload chunks sequentially using query parameters
        for (let i = 0; i < chunks.length; i++) {
            console.log(`Uploading chunk ${i + 1}/${chunks.length} via query params...`);
            
            const params = new URLSearchParams({
                sessionId,
                chunkIndex: i.toString(),
                chunkData: chunks[i],
                totalChunks: chunks.length.toString(),
                filename: data.imageFile.name,
                title: data.title || '',
                subtitle: data.subtitle || ''
            });
            
            console.log(`Chunk ${i + 1} query params length:`, params.toString().length);
            
            const response = await fetch(`/api/admin/banners/chunked-query?${params.toString()}`, {
                method: 'POST',
                credentials: 'include',
            });
            
            console.log(`Chunk ${i + 1} response status:`, response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Chunk ${i + 1} upload failed:`, errorText);
                throw new Error(`Chunk upload failed: ${response.status} - ${errorText}`);
            }
            
            // If this is the last chunk, we should get the banner response
            if (i === chunks.length - 1) {
                console.log('Final chunk uploaded, processing response...');
                return handleDatabaseResponse<Banner>(response);
            } else {
                // For intermediate chunks, just log the response
                const chunkResponse = await response.json();
                console.log(`Chunk ${i + 1} response:`, chunkResponse);
            }
        }
        
        throw new Error('Chunked upload completed but no banner returned');
        
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
