import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';

interface XPRow extends RowDataPacket {
    total_xp: number;
}

interface StreakRow extends RowDataPacket {
    streak: number;
}

interface HeartsRow extends RowDataPacket {
    hearts: number;
}

interface DueCardsRow extends RowDataPacket {
    chapter: string;
    due_cards: number;
}

const router = Router();

// Get user progress
// Reset hearts (for testing)
router.post('/refill-hearts/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        // Delete all wrong answers from today to reset hearts
        await db.query(
            `DELETE FROM reviews 
             WHERE user_id = ? 
             AND was_correct = false 
             AND DATE(attempt_time) = CURDATE()`,
            [userId]
        );
        
        res.json({ message: 'Hearts refilled successfully' });
    } catch (error) {
        console.error('Error refilling hearts:', error);
        res.status(500).json({ error: 'Error refilling hearts' });
    }
});

router.get('/user-progress/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        // Get total XP (10 base + up to 20 bonus per correct answer)
        interface XPRow extends RowDataPacket {
            total_xp: number;
        }
        const xpResult = await db.query<XPRow[]>(`
            SELECT COUNT(*) * 10 + 
                   CAST(SUM((1 - cards.difficulty) * 20) AS SIGNED) as total_xp
            FROM reviews
            JOIN cards ON reviews.card_id = cards.card_id
            WHERE user_id = ? AND was_correct = true
        `, [userId]);

        // Get current streak (days in a row with correct answers)
        const streakResult = await db.query<StreakRow[]>(`
            WITH RECURSIVE dates AS (
                SELECT CURDATE() as date
                UNION ALL
                SELECT DATE_SUB(date, INTERVAL 1 DAY)
                FROM dates
                WHERE DATE_SUB(date, INTERVAL 1 DAY) >= 
                    (SELECT DATE(MIN(attempt_time)) FROM reviews WHERE user_id = ?)
            ),
            daily_activity AS (
                SELECT DATE(attempt_time) as day,
                       COUNT(DISTINCT card_id) as cards_reviewed,
                       COUNT(CASE WHEN was_correct THEN 1 END) as correct_answers
                FROM reviews
                WHERE user_id = ?
                GROUP BY DATE(attempt_time)
            )
            SELECT COUNT(*) as streak
            FROM (
                SELECT d.date
                FROM dates d
                LEFT JOIN daily_activity da ON d.date = da.day
                WHERE da.cards_reviewed > 0
                  AND da.correct_answers > 0
                ORDER BY d.date DESC
            ) active_days
            WHERE date >= (
                SELECT MAX(date)
                FROM (
                    SELECT d.date
                    FROM dates d
                    LEFT JOIN daily_activity da ON d.date = da.day
                    WHERE da.cards_reviewed IS NULL
                       OR da.correct_answers = 0
                ) missed_days
            ) OR date IS NULL
        `, [userId, userId]);

        // Get remaining hearts (lose heart on wrong answer, reset daily)
        const heartsResult = await db.query<HeartsRow[]>(`
            SELECT 5 - COUNT(*) as hearts
            FROM reviews
            WHERE user_id = ?
            AND was_correct = false
            AND DATE(attempt_time) = CURDATE()
        `, [userId]);

        // Get number of due cards per chapter
        const dueCardsResult = await db.query<DueCardsRow[]>(`
            SELECT c.chapter, COUNT(*) as due_cards
            FROM cards c
            LEFT JOIN schedules s ON c.card_id = s.card_id AND s.user_id = ?
            WHERE s.next_due_time IS NULL OR s.next_due_time <= NOW()
            GROUP BY c.chapter
        `, [userId]);

        res.json({
            xp: xpResult[0]?.total_xp || 0,
            streak: streakResult[0]?.streak || 0,
            hearts: Math.max(0, heartsResult[0]?.hearts || 5),
            due_cards_by_chapter: dueCardsResult.reduce((acc, { chapter, due_cards }) => {
                acc[chapter] = due_cards;
                return acc;
            }, {} as Record<string, number>)
        });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ error: 'Error fetching user progress' });
    }
});

export default router;