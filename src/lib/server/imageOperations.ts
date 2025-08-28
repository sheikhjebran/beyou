import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const VALID_DIRECTORIES = ['products', 'banners', 'categories', 'profiles'];

// Ensure upload directories exist
export async function ensureUploadDirs() {
    const dirs = VALID_DIRECTORIES.map(
        dir => path.join(UPLOADS_DIR, dir)
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
    const relativePath = path.join('uploads', category, filename).replace(/\\/g, '/');
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    
    // Save file
    await fs.writeFile(fullPath, buffer);
    
    // Return file info
    return {
        filename,
        path: relativePath
    };
}

export async function deleteUploadedFile(imagePath: string): Promise<void> {
    if (!imagePath) return;
    
    try {
        const fullPath = path.join(process.cwd(), 'public', imagePath);

        // Security check: ensure the file is within the uploads directory
        const normalizedPath = path.normalize(fullPath);
        if (!normalizedPath.startsWith(UPLOADS_DIR)) {
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
