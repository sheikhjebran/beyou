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

export async function saveFile(file: File, subDirectory: string = ''): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullDirectory = path.join(UPLOAD_DIR, subDirectory);
    
    // Create subdirectory if it doesn't exist
    await mkdir(fullDirectory, { recursive: true });
    
    const filePath = path.join(fullDirectory, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Return the path relative to the public directory
    return `/uploads/${subDirectory}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
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
