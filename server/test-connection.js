const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DB_URL:', process.env.DB_URL);
        
        const dbUrl = new URL(process.env.DB_URL);
        console.log('Host:', dbUrl.hostname);
        console.log('Port:', dbUrl.port || 3306);
        console.log('Database:', dbUrl.pathname.replace('/', ''));
        console.log('User:', dbUrl.username);
        console.log('Password:', dbUrl.password ? '***hidden***' : 'NOT SET');
        
        const connection = await mysql.createConnection({
            host: dbUrl.hostname,
            user: dbUrl.username,
            password: dbUrl.password,
            database: dbUrl.pathname.replace('/', ''),
            port: Number(dbUrl.port) || 3306
        });
        
        console.log('Connection successful!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Query test result:', rows);
        
        await connection.end();
        console.log('Connection closed successfully.');
        
    } catch (error) {
        console.error('Connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('SQL State:', error.sqlState);
    }
}

testConnection();