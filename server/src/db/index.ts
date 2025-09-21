import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        const dbUrl = new URL(process.env.DB_URL || '');
        const password = dbUrl.password || '';
        const user = dbUrl.username || '';
        const database = dbUrl.pathname.replace('/', '');
        
        this.pool = createPool({
            host: dbUrl.hostname,
            user: user,
            password: password,
            database: database,
            port: Number(dbUrl.port) || 3306,
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
}

export default Database.getInstance();