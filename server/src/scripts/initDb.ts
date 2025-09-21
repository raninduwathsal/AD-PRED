import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initializeDatabase() {
    const dbUrl = new URL(process.env.DB_URL || '');
    const password = dbUrl.password || '';
    const user = dbUrl.username || '';
    const database = dbUrl.pathname.replace('/', '');
    
    try {
        // Create connection without database specified
        const initialPool = createPool({
            host: dbUrl.hostname,
            user: user,
            password: password,
            port: Number(dbUrl.port) || 3306
        });

        // Create database if it doesn't exist
        await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
        console.log('Database created or already exists');

        // Create connection with database specified
        const pool = createPool({
            host: dbUrl.hostname,
            user: user,
            password: password,
            database: database,
            port: Number(dbUrl.port) || 3306
        });

        // Read and execute schema SQL
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Schema created successfully');

        // Read and execute seed SQL
        const seedPath = path.join(__dirname, '../db/seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seed);
        console.log('Seed data inserted successfully');

        await pool.end();
        await initialPool.end();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();