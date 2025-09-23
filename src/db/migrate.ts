// Database migration runner
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

type MigrationRecord = {
    id: number;
    name: string;
    executed_at: Date;
};

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        port: parseInt(process.env.MYSQL_PORT || '3306')
    });

    try {
        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS beyou_db');
        await connection.query('USE beyou_db');

        // Create migrations table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get list of executed migrations
        const [rows] = await connection.query('SELECT * FROM migrations ORDER BY id') as [MigrationRecord[], any];
        const executedMigrations = new Set(rows.map(row => row.id));

        // Read migration files
        // Get current file's directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        
        const migrationsDir = join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensure ordered execution

        // Execute new migrations
        for (const file of migrationFiles) {
            const migrationId = parseInt(file.split('_')[0]);
            
            if (!executedMigrations.has(migrationId)) {
                console.log(`Executing migration: ${file}`);
                
                const migrationPath = join(migrationsDir, file);
                const migrationContent = await fs.readFile(migrationPath, 'utf8');
                
                // Split and execute each statement
                const statements = migrationContent
                    .split(';')
                    .filter(stmt => stmt.trim())
                    .map(stmt => stmt + ';');

                for (const statement of statements) {
                    if (statement.trim() !== ';') {
                        await connection.query(statement);
                    }
                }

                // Record migration
                await connection.query(
                    'INSERT INTO migrations (id, name) VALUES (?, ?)',
                    [migrationId, file]
                );

                console.log(`Migration ${file} completed successfully`);
            }
        }

        console.log('All migrations completed successfully');

    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run migrations
runMigrations().catch(console.error);
