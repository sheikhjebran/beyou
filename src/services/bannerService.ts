
'use client'

import { handleDatabaseResponse } from '@/lib/mysql';
import type { Banner, AddBannerData } from '@/types/banner';

// Re-export types for client use
export type { AddBannerData };

export async function getBanners(): Promise<Banner[]> {
    const response = await fetch('/api/banners');
    return handleDatabaseResponse<Banner[]>(response);
}

export async function addBanner(data: AddBannerData): Promise<Banner> {
    const formData = new FormData();
    formData.append('imageFile', data.imageFile);
    if (data.title) formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);

    const response = await fetch('/api/banners', {
        method: 'POST',
        body: formData,
    });

    return handleDatabaseResponse<Banner>(response);
}

export async function deleteBanner(bannerId: string): Promise<void> {
    const response = await fetch(`/api/banners?id=${bannerId}`, {
        method: 'DELETE',
    });

    return handleDatabaseResponse<void>(response);
}
