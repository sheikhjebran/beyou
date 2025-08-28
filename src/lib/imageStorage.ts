'use client'

export type UploadedImage = {
    filename: string;
    path: string;
    url: string;
};

export async function uploadImage(file: File, subDirectory: string): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', subDirectory);

    const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return {
        filename: result.filename,
        path: result.path,
        url: `/${result.path}`
    };
}

export async function deleteImage(filepath: string): Promise<void> {
    if (!filepath) return;

    const response = await fetch(`/api/images?path=${encodeURIComponent(filepath)}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete image');
    }
}

export function getImageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
}
