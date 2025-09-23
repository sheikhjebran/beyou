import { createConnection } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beyou_db',
};

async function inspectPaths() {
  const connection = await createConnection(dbConfig);
  
  try {
    console.log('Inspecting actual image paths...');

    // Check products table paths
    console.log('\n=== PRODUCTS PRIMARY IMAGE PATHS ===');
    const [productPaths] = await connection.execute(`
      SELECT id, name, primary_image_path, 
             LENGTH(primary_image_path) as path_length,
             CHAR_LENGTH(primary_image_path) as char_length
      FROM products 
      WHERE primary_image_path IS NOT NULL 
      LIMIT 5
    `);
    console.table(productPaths);

    // Check for backslashes specifically
    console.log('\n=== CHECKING FOR BACKSLASHES IN PRODUCTS ===');
    const [backslashCheck] = await connection.execute(`
      SELECT id, name, primary_image_path,
             primary_image_path LIKE '%\\\\%' as has_backslash,
             primary_image_path LIKE '%\\%' as has_single_backslash
      FROM products 
      WHERE primary_image_path IS NOT NULL 
      LIMIT 5
    `);
    console.table(backslashCheck);

    // Check product_images table
    console.log('\n=== PRODUCT_IMAGES TABLE PATHS ===');
    const [productImagePaths] = await connection.execute(`
      SELECT id, product_id, image_path, is_primary,
             image_path LIKE '%\\\\%' as has_double_backslash,
             image_path LIKE '%\\%' as has_single_backslash
      FROM product_images 
      LIMIT 5
    `);
    console.table(productImagePaths);

    console.log('\n=== RAW HEX DATA FOR FIRST PRODUCT PATH ===');
    const [hexData] = await connection.execute(`
      SELECT primary_image_path, HEX(primary_image_path) as hex_data
      FROM products 
      WHERE primary_image_path IS NOT NULL 
      LIMIT 1
    `);
    console.table(hexData);

  } catch (error) {
    console.error('Error inspecting paths:', error);
  } finally {
    await connection.end();
  }
}

inspectPaths();