// Test script to verify upload API route works
import path from 'path';
import fs from 'fs/promises';

// Replicate the path logic here for testing
function getUploadDirectory(): string {
    return process.env.NODE_ENV === 'production' 
        ? (process.env.UPLOAD_DIR || '/var/www/beyou/uploads')
        : path.join(process.cwd(), 'public/uploads');
}

function getStoragePath(publicPath: string): string {
    if (!publicPath.startsWith('/uploads/')) {
        return publicPath;
    }
    const uploadDir = getUploadDirectory();
    return path.join(uploadDir, publicPath.replace('/uploads/', ''));
}

async function testUploadRoute() {
    console.log('🧪 Testing upload API route...');
    
    // Test path conversion
    const testPublicPath = '/uploads/banners/test-banner.jpg';
    const storagePath = getStoragePath(testPublicPath);
    
    console.log('📍 Path conversion test:');
    console.log(`Public path: ${testPublicPath}`);
    console.log(`Storage path: ${storagePath}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if uploads directory exists
    try {
        const uploadDir = path.dirname(storagePath);
        const stats = await fs.stat(uploadDir);
        console.log('✅ Upload directory exists:', uploadDir);
        console.log('📁 Directory stats:', { isDirectory: stats.isDirectory() });
    } catch (error) {
        console.log('❌ Upload directory not found:', path.dirname(storagePath));
    }
    
    // List available banner files
    try {
        const bannersDir = path.join(process.cwd(), 'public/uploads/banners');
        const files = await fs.readdir(bannersDir);
        console.log('🖼️  Available banner files:', files);
        
        // Test first file if available
        if (files.length > 0) {
            const testFile = files[0];
            const testPath = `/uploads/banners/${testFile}`;
            console.log('🧪 Test file path:', testPath);
            console.log('📍 This should be accessible via API at: /api/uploads/banners/' + testFile);
        }
    } catch (error) {
        console.log('❌ Could not list banner files:', error);
    }
}

// Run test
testUploadRoute().catch(console.error);