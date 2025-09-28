import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initializeDatabase() {
    let host: string, user: string, password: string, database: string, port: number;
    
    if (process.env.DB_URL) {
        const dbUrl = new URL(process.env.DB_URL);
        host = dbUrl.hostname;
        user = dbUrl.username || 'root';
        password = dbUrl.password || '';
        database = dbUrl.pathname.replace('/', '');
        port = Number(dbUrl.port) || 3306;
    } else {
        // Fallback to individual environment variables
        host = process.env.DB_HOST || 'localhost';
        user = process.env.DB_USER || 'root';
        password = process.env.DB_PASSWORD || '';
        database = process.env.DB_NAME || 'testdb';
        port = Number(process.env.DB_PORT) || 3306;
    }
    
    try {
        // Create connection without database specified
        const initialPool = createPool({
            host: host,
            user: user,
            password: password,
            port: port
        });

        // Create database if it doesn't exist
        await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
        console.log('Database created or already exists');

        // Create connection with database specified
        const pool = createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            port: port
        });

        // Check if tables already exist
        const [rows] = await pool.query("SHOW TABLES");
        if (Array.isArray(rows) && rows.length > 0) {
            console.log('Tables already exist, skipping initialization');
            await pool.end();
            await initialPool.end();
            return;
        }

        // Read and execute schema SQL
        // Try multiple possible paths for the schema file
        let schemaPath = path.join(__dirname, '../db/schema.sql');
        if (!fs.existsSync(schemaPath)) {
            schemaPath = path.join(process.cwd(), 'db/schema.sql');
        }
        if (!fs.existsSync(schemaPath)) {
            schemaPath = path.join(__dirname, '../../db/schema.sql');
        }
        
        if (!fs.existsSync(schemaPath)) {
            console.log('Schema file not found, skipping schema creation');
        } else {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schema);
            console.log('Schema created successfully');
        }

        // Read and execute seed SQL
        let seedPath = path.join(__dirname, '../db/seed.sql');
        if (!fs.existsSync(seedPath)) {
            seedPath = path.join(process.cwd(), 'db/seed.sql');
        }
        if (!fs.existsSync(seedPath)) {
            seedPath = path.join(__dirname, '../../db/seed.sql');
        }
        
        if (!fs.existsSync(seedPath)) {
            console.log('Seed file not found, skipping seed data');
        } else {
            const seed = fs.readFileSync(seedPath, 'utf8');
            await pool.query(seed);
            console.log('Seed data inserted successfully');
        }

        await pool.end();
        await initialPool.end();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();