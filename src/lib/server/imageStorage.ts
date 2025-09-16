import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export type UploadedImage = {
    filename: string;
    path: string;
};

export async function uploadImageToServer(fileBuffer: Buffer, originalFilename: string, subDirectory: string): Promise<UploadedImage> {
    try {
        // Create a unique filename
        const extension = path.extname(originalFilename);
        const filename = `${uuidv4()}${extension}`;
        
        // Simplify the directory structure
        const baseDir = path.join(process.cwd(), 'public', 'uploads');
        const categoryDir = path.join(baseDir, subDirectory.split('/')[0]); // Just use the first part of subDirectory
        await mkdir(categoryDir, { recursive: true });
        
        // Create the full path with flattened structure
        const fullPath = path.join(categoryDir, filename);
        
        // Write the file
        await writeFile(fullPath, fileBuffer);
        
        // Create public path with forward slashes
        const publicPath = `/uploads/${subDirectory.split('/')[0]}/${filename}`;
        
        return {
            filename,
            path: publicPath
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

export async function deleteImageFromServer(imagePath: string): Promise<{ success: boolean; error?: string }> {
    if (!imagePath) {
        return { success: false, error: 'No image path provided' };
    }

    try {
        // Remove any leading slashes and 'uploads/' prefix
        const relativePath = imagePath.replace(/^\/+/, '').replace(/^uploads\//, '');
        const baseDir = path.join(process.cwd(), 'public', 'uploads');
        const fullPath = path.join(baseDir, relativePath);

        // Security check: ensure the file is within the uploads directory
        const normalizedPath = path.normalize(fullPath);
        if (!normalizedPath.startsWith(baseDir)) {
            return { success: false, error: 'Invalid file path' };
        }

        // Check if file exists before attempting deletion
        if (!existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            return { success: true }; // Consider it a success if file is already gone
        }

        await unlink(fullPath);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete image'
        };
    }
}
