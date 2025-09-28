import { createPool, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
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
        
        this.pool = createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            port: port,
            connectionLimit: 10,
            multipleStatements: false
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
        const [rows] = await this.pool.query<T>(sql, params);
        return rows;
    }

    public async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
        return result;
    }
}

export default Database.getInstance();