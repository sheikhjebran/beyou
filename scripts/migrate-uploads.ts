import fs from 'fs/promises';
import path from 'path';
import { getUploadDirectory } from '../src/lib/server/paths';

async function migrateFiles() {
    const sourceDir = path.join(process.cwd(), 'public/uploads');
    const targetDir = getUploadDirectory();

    try {
        // Create target directory if it doesn't exist
        await fs.mkdir(targetDir, { recursive: true });

        // Helper function to recursively copy directory
        async function copyDir(src: string, dest: string) {
            const entries = await fs.readdir(src, { withFileTypes: true });

            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);

                if (entry.isDirectory()) {
                    await fs.mkdir(destPath, { recursive: true });
                    await copyDir(srcPath, destPath);
                } else {
                    await fs.copyFile(srcPath, destPath);
                    console.log(`Copied: ${srcPath} -> ${destPath}`);
                }
            }
        }

        // Start copying files
        console.log(`Migrating files from ${sourceDir} to ${targetDir}`);
        await copyDir(sourceDir, targetDir);
        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run migration
migrateFiles();