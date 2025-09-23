import path from 'path';

// Define base paths for uploads
export const PERSISTENT_UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/beyou/uploads';
export const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Function to get the appropriate upload directory based on environment
export function getUploadDirectory(): string {
    return process.env.NODE_ENV === 'production' 
        ? PERSISTENT_UPLOAD_DIR 
        : PUBLIC_UPLOAD_DIR;
}

// Function to convert storage path to public URL path
export function getPublicPath(filePath: string): string {
    const uploadDir = getUploadDirectory();
    // Normalize the path and replace backslashes with forward slashes for URLs
    const relativePath = filePath.replace(uploadDir, '').replace(/\\/g, '/');
    return `/uploads${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

// Function to convert public URL path to storage path
export function getStoragePath(publicPath: string): string {
    if (!publicPath.startsWith('/uploads/')) {
        return publicPath;
    }
    const uploadDir = getUploadDirectory();
    return path.join(uploadDir, publicPath.replace('/uploads/', ''));
}