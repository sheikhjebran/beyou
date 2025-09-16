import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUploadDirectory, getPublicPath } from './paths';

const VALID_DIRECTORIES = ['products', 'banners', 'categories', 'profiles'];

// Ensure upload directories exist
export async function ensureUploadDirs() {
    const uploadDir = getUploadDirectory();
    const dirs = VALID_DIRECTORIES.map(
        dir => path.join(uploadDir, dir)
    );

    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Initialize directories
ensureUploadDirs().catch(console.error);

export async function saveUploadedFile(buffer: Buffer, originalName: string, category: string): Promise<{ filename: string; path: string }> {
    if (!category || !VALID_DIRECTORIES.includes(category)) {
        throw new Error('Invalid upload directory');
    }

    // Generate unique filename
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    
    // Create full path
    const uploadDir = getUploadDirectory();
    const storagePath = path.join(uploadDir, category, filename);
    
    // Save file
    await fs.writeFile(storagePath, buffer);
    
    // Return file info with public path
    const publicPath = getPublicPath(storagePath);
    return {
        filename,
        path: publicPath.replace(/^\//, '') // Remove leading slash to match existing behavior
    };
}

export async function deleteUploadedFile(imagePath: string): Promise<void> {
    if (!imagePath) return;
    
    try {
        const uploadDir = getUploadDirectory();
        const fullPath = path.join(uploadDir, imagePath.replace(/^\/uploads\//, ''));

        // Security check: ensure the file is within the uploads directory
        const normalizedPath = path.normalize(fullPath);
        if (!normalizedPath.startsWith(uploadDir)) {
            throw new Error('Invalid file path');
        }

        await fs.unlink(fullPath);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

export async function getUploadedFileInfo(filePath: string) {
    if (!filePath) return null;
    
    try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        const stats = await fs.stat(fullPath);
        return {
            exists: true,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };
    } catch (error) {
        return {
            exists: false,
            error: (error as Error).message
        };
    }
}
