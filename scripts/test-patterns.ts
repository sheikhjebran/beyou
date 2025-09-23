import { createConnection } from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beyou_db',
};

async function testPatterns() {
  const connection = await createConnection(dbConfig);
  
  try {
    console.log('Testing different backslash patterns...');

    // Test various patterns
    const patterns = [
      { name: 'CHAR(92)', pattern: `primary_image_path LIKE CONCAT('%', CHAR(92), '%')` },
      { name: 'Single backslash', pattern: `primary_image_path LIKE '%\\%'` },
      { name: 'Double backslash', pattern: `primary_image_path LIKE '%\\\\%'` },
      { name: 'Literal check', pattern: `primary_image_path LIKE '%uploads\\\\products%'` },
      { name: 'INSTR check', pattern: `INSTR(primary_image_path, CHAR(92)) > 0` }
    ];

    for (const pattern of patterns) {
      console.log(`\n=== Testing ${pattern.name} ===`);
      const [results] = await connection.execute(`
        SELECT primary_image_path, '${pattern.name}' as pattern_name
        FROM products 
        WHERE primary_image_path IS NOT NULL AND ${pattern.pattern}
        LIMIT 3
      `);
      console.log(`Found ${(results as any[]).length} matches`);
      if ((results as any[]).length > 0) {
        console.table(results);
      }
    }

    // Let's also test by manually updating one record to see what happens
    console.log('\n=== Manual test update ===');
    const [testUpdate] = await connection.execute(`
      SELECT primary_image_path, 
             REPLACE(primary_image_path, CHAR(92), '/') as replaced_path
      FROM products 
      WHERE id = '4e19cf3a-bb28-47e1-9ebf-cf0cdfaad0aa'
    `);
    console.table(testUpdate);

  } catch (error) {
    console.error('Error testing patterns:', error);
  } finally {
    await connection.end();
  }
}

testPatterns();