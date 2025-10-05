import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 4000;

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.CLEARDB_DATABASE_URL ||
    process.env.JAWSDB_URL
  );
}

function getMysqlConfigFromUrl(databaseUrl: string) {
  // Expected format: mysql://user:pass@host:port/dbname
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''),
  };
}

app.post('/api/cards/bulk', async (req, res) => {
  try {
    const { cards } = req.body as { cards: Array<Record<string, unknown>> };
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'No cards provided' });
    }

    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    const config = getMysqlConfigFromUrl(databaseUrl);
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: false,
    });

    const insertSql = `INSERT INTO cards (video_url, question, option_1, option_2, option_3, option_4, correct_answer, chapter, difficulty) VALUES ?`;

    const values: any[] = cards.map((c: any) => [
      c.video_url,
      c.question,
      c.option_1,
      c.option_2,
      c.option_3,
      c.option_4,
      c.correct_answer,
      c.chapter,
      Number(c.difficulty ?? 0.5),
    ]);

    const [result] = await connection.query<any>(insertSql, [values]);
    await connection.end();

    return res.json({ success: true, inserted: values.length, result });
  } catch (error: any) {
    console.error('Bulk insert failed:', error);
    return res.status(500).json({ error: error?.message || 'Unknown error' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  const dbUrlPresent = Boolean(getDatabaseUrl());
  console.log(`Server running on http://localhost:${PORT}`);
  if (!dbUrlPresent) {
    console.warn('Warning: No database URL found. Set one of DATABASE_URL, MYSQL_URL, CLEARDB_DATABASE_URL, or JAWSDB_URL in your .env');
  }
});


