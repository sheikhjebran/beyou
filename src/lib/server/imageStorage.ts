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
        // Validate the buffer
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('Invalid file buffer');
        }

        // Validate file extension
        const extension = path.extname(originalFilename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExtensions.includes(extension)) {
            throw new Error('Invalid file type. Only jpg, jpeg, png, gif, and webp files are allowed.');
        }

        // Create a unique filename
        const filename = `${uuidv4()}${extension}`;
        
        // Normalize the subdirectory
        const normalizedSubDir = subDirectory.split('/')[0].replace(/[^a-zA-Z0-9-]/g, '');
        
        // Set up the directory structure
        const baseDir = path.join(process.cwd(), 'public', 'uploads');
        const categoryDir = path.join(baseDir, normalizedSubDir);
        
        // Ensure the directory exists with proper permissions
        await mkdir(baseDir, { recursive: true, mode: 0o755 });
        await mkdir(categoryDir, { recursive: true, mode: 0o755 });
        
        // Create the full path with flattened structure
        const fullPath = path.join(categoryDir, filename);
        
        // Write the file with proper permissions
        await writeFile(fullPath, fileBuffer, { mode: 0o644 });
        
        // Create public path with forward slashes for URLs
        const publicPath = `/uploads/${normalizedSubDir}/${filename}`;
        
        // Verify the file was written successfully
        if (!existsSync(fullPath)) {
            throw new Error('Failed to verify file creation');
        }
        
        return {
            filename,
            path: publicPath
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
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
