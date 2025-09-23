import { createConnection } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beyou_db',
};

async function fixImagePaths() {
  const connection = await createConnection(dbConfig);
  
  try {
    console.log('Starting image path cleanup...');

    // Fix product primary image paths in products table
    console.log('Fixing primary_image_path in products table...');
    const [productResult] = await connection.execute(`
      UPDATE products 
      SET primary_image_path = REPLACE(primary_image_path, CHAR(92), '/') 
      WHERE INSTR(primary_image_path, CHAR(92)) > 0
    `);
    console.log(`Updated ${(productResult as any).affectedRows} product primary image paths`);

    // Fix paths in product_images table
    console.log('Fixing paths in product_images table...');
    const [imageTableResult] = await connection.execute(`
      UPDATE product_images 
      SET image_path = REPLACE(image_path, CHAR(92), '/') 
      WHERE INSTR(image_path, CHAR(92)) > 0
    `);
    console.log(`Updated ${(imageTableResult as any).affectedRows} product_images paths`);

    // Fix banner paths (column is image_path, not banner_path)
    console.log('Fixing banner image paths...');
    const [bannerResult] = await connection.execute(`
      UPDATE banners 
      SET image_path = REPLACE(image_path, CHAR(92), '/') 
      WHERE INSTR(image_path, CHAR(92)) > 0
    `);
    console.log(`Updated ${(bannerResult as any).affectedRows} banner image paths`);

    // Fix category image paths
    console.log('Fixing category image paths...');
    const [categoryResult] = await connection.execute(`
      UPDATE category_images 
      SET image_path = REPLACE(image_path, CHAR(92), '/') 
      WHERE INSTR(image_path, CHAR(92)) > 0
    `);
    console.log(`Updated ${(categoryResult as any).affectedRows} category image paths`);

    console.log('\n=== Verification - Sample Updated Paths ===');
    const [verificationResult] = await connection.execute(`
      SELECT primary_image_path
      FROM products 
      WHERE primary_image_path IS NOT NULL 
      LIMIT 3
    `);
    console.table(verificationResult);

    console.log('Image path cleanup completed successfully!');

  } catch (error) {
    console.error('Error fixing image paths:', error);
  } finally {
    await connection.end();
  }
}

fixImagePaths();