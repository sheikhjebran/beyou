import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export type UploadedImage = {
    filename: string;
    path: string;
};

export async function uploadImageToServer(fileBuffer: Buffer, originalFilename: string, subDirectory: string): Promise<UploadedImage> {
    try {
        // Create a unique filename
        const extension = path.extname(originalFilename);
        const filename = `${uuidv4()}${extension}`;
        
        // Create the full path
        const relativePath = path.join(subDirectory, filename);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const fullPath = path.join(uploadDir, relativePath);
        
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        await mkdir(dir, { recursive: true });
        
        // Write the file
        await writeFile(fullPath, fileBuffer);
        
        const publicPath = `/uploads/${relativePath.replace(/\\/g, '/')}`;
        
        return {
            filename,
            path: publicPath
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}
