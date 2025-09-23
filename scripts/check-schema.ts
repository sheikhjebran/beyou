import { createConnection } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beyou_db',
};

async function checkSchema() {
  const connection = await createConnection(dbConfig);
  
  try {
    console.log('Checking database schema...');

    // Check products table structure
    console.log('\n=== PRODUCTS TABLE STRUCTURE ===');
    const [productsColumns] = await connection.execute(`DESCRIBE products`);
    console.table(productsColumns);

    // Check if product_images table exists
    console.log('\n=== CHECKING FOR PRODUCT_IMAGES TABLE ===');
    try {
      const [productImagesColumns] = await connection.execute(`DESCRIBE product_images`);
      console.table(productImagesColumns);
    } catch (error) {
      console.log('product_images table does not exist');
    }

    // Check banners table structure
    console.log('\n=== BANNERS TABLE STRUCTURE ===');
    const [bannersColumns] = await connection.execute(`DESCRIBE banners`);
    console.table(bannersColumns);

    // Check category_images table structure
    console.log('\n=== CATEGORY_IMAGES TABLE STRUCTURE ===');
    try {
      const [categoryImagesColumns] = await connection.execute(`DESCRIBE category_images`);
      console.table(categoryImagesColumns);
    } catch (error) {
      console.log('category_images table does not exist');
    }

    // Show sample data from products with paths
    console.log('\n=== SAMPLE PRODUCT PATHS ===');
    const [sampleProducts] = await connection.execute(`
      SELECT id, name, primary_image_path 
      FROM products 
      WHERE primary_image_path IS NOT NULL 
      LIMIT 3
    `);
    console.table(sampleProducts);

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await connection.end();
  }
}

checkSchema();