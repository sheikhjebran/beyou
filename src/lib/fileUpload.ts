import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure the uploads directory exists
import { mkdir } from 'fs/promises';
try {
  await mkdir(UPLOAD_DIR, { recursive: true });
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

export type FileUploadResult = {
  success: boolean;
  path?: string;
  error?: string;
};

export async function saveFile(subDirectory: string, file: File): Promise<FileUploadResult> {
  try {
    console.log('Saving file:', file.name, 'to directory:', subDirectory);
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullDirectory = path.join(UPLOAD_DIR, subDirectory);
    
    // Create subdirectory if it doesn't exist
    console.log('Creating directory:', fullDirectory);
    await mkdir(fullDirectory, { recursive: true });
    
    const filePath = path.join(fullDirectory, fileName);
    console.log('Writing file to:', filePath);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    const publicPath = `/uploads/${subDirectory}/${fileName}`;
    console.log('File saved successfully. Public path:', publicPath);
    
    // Return the path relative to the public directory
    return {
      success: true,
      path: publicPath
    };
  } catch (error) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save file'
    };
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}
