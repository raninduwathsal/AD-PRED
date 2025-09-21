import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';

const router = Router();

// Get all chapters
router.get('/chapters', async (req, res) => {
    try {
        interface ChapterRow extends RowDataPacket {
            chapter: string;
        }
        const chapters = await db.query<ChapterRow[]>(
            'SELECT DISTINCT chapter FROM cards'
        );
        res.json(chapters.map(c => c.chapter));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chapters' });
    }
});

export default router;