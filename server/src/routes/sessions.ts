import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import axios from 'axios';
import db from '../db';
import { Card, CardPredictionData, SessionCard } from '../types';

const router = Router();
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000/predict';

interface CardWithStats extends Card {
    time_since_last: number;
    times_reviewed: number;
    last_correct: boolean;
}

// Helper function to shuffle array
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Start session endpoint
router.post('/start-session', async (req, res) => {
    try {
        const { user_id, chapter } = req.body;

        // Get due cards for the chapter
        const cards = await db.query<CardWithStats[]>(`
            SELECT c.*, 
                   COALESCE(r.times_reviewed, 0) as times_reviewed,
                   COALESCE(r.was_correct, false) as last_correct,
                   COALESCE(TIMESTAMPDIFF(HOUR, r.attempt_time, NOW()), 0) as time_since_last
            FROM cards c
            LEFT JOIN schedules s ON c.card_id = s.card_id AND s.user_id = ?
            LEFT JOIN reviews r ON r.card_id = c.card_id AND r.user_id = ?
                AND r.attempt_time = (
                    SELECT MAX(attempt_time)
                    FROM reviews
                    WHERE card_id = c.card_id AND user_id = ?
                )
            WHERE c.chapter = ?
            AND (s.next_due_time IS NULL OR s.next_due_time <= NOW())
            LIMIT 50
        `, [user_id, user_id, user_id, chapter]);

        if (cards.length === 0) {
            return res.status(404).json({ error: 'No cards available for this chapter' });
        }

        // Prepare data for Flask prediction
        const predictionData: CardPredictionData[] = cards.map(card => ({
            user_id,
            card_id: card.card_id,
            chapter: card.chapter,
            time_since_last_review: card.time_since_last || 0,
            times_reviewed: card.times_reviewed || 0,
            last_attempt_correct: card.last_correct || false,
            card_difficulty: card.difficulty
        }));

        let probabilities: number[];
        try {
            // Call Flask service
            const response = await axios.post(FLASK_URL, { data: predictionData });
            probabilities = response.data.predictions;
        } catch (error) {
            // Fallback to card difficulty if Flask fails
            console.error('Flask service error:', error);
            probabilities = cards.map(card => card.difficulty);
        }

        // Combine cards with probabilities
        const sessionCards: SessionCard[] = cards.map((card, i) => ({
            ...card,
            prob_correct: probabilities[i]
        }));

        // Sort by probability and interleave hard/easy cards
        const hardCards = sessionCards.filter(c => c.prob_correct < 0.5);
        const easyCards = sessionCards.filter(c => c.prob_correct >= 0.5);
        const shuffledHard = shuffle(hardCards);
        const shuffledEasy = shuffle(easyCards);

        const selectedCards = [];
        let hardIndex = 0;
        let easyIndex = 0;

        while (selectedCards.length < 20 && (hardIndex < shuffledHard.length || easyIndex < shuffledEasy.length)) {
            if (hardIndex < shuffledHard.length) {
                selectedCards.push(shuffledHard[hardIndex++]);
            }
            if (easyIndex < shuffledEasy.length && selectedCards.length < 20) {
                selectedCards.push(shuffledEasy[easyIndex++]);
            }
        }

        // Prepare response cards (shuffle options for each card)
        const sessionResponse = selectedCards.map(card => {
            const options = shuffle([card.option_1, card.option_2, card.option_3, card.option_4]);
            return {
                card_id: card.card_id,
                video_url: card.video_url,
                options,
                prob_correct: card.prob_correct
            };
        });

        res.json(sessionResponse);
    } catch (error) {
        console.error('Session error:', error);
        res.status(500).json({ error: 'Error starting session' });
    }
});

// Submit answer endpoint
router.post('/submit-answer', async (req, res) => {
    try {
        console.log('Received submit answer request:', req.body);
        const { user_id, card_id, chosen_answer, response_time } = req.body;
        
        // Debug logs
        console.log('Processing answer submission:', {
            user_id,
            card_id,
            chosen_answer,
            response_time,
            timestamp: new Date().toISOString()
        });
        
        if (!user_id || !card_id || !chosen_answer) {
            console.error('Missing required fields:', { user_id, card_id, chosen_answer });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get card details
        console.log('Fetching card details for card_id:', card_id);
        const cards = await db.query<Card[]>(
            'SELECT * FROM cards WHERE card_id = ?',
            [card_id]
        );
        console.log('Card query result:', cards);

        if (cards.length === 0) {
            console.log('Card not found for card_id:', card_id);
            return res.status(404).json({ error: 'Card not found' });
        }

        const card = cards[0];
        const was_correct = chosen_answer === card.correct_answer;
        console.log('Answer validation:', {
            chosen_answer,
            correct_answer: card.correct_answer,
            was_correct,
            cardId: card.card_id
        });

        // Get previous review data
        const reviews = await db.query<any[]>(`
            SELECT times_reviewed, last_correct, TIMESTAMPDIFF(HOUR, attempt_time, NOW()) as time_since_last
            FROM reviews
            WHERE user_id = ? AND card_id = ?
            ORDER BY attempt_time DESC
            LIMIT 1
        `, [user_id, card_id]);

        const times_reviewed = (reviews[0]?.times_reviewed || 0) + 1;
        const time_since_last = reviews[0]?.time_since_last || 0;
        const last_correct = reviews[0]?.last_correct || false;

        // Calculate XP
        let prob_correct;
        try {
            const response = await axios.post(FLASK_URL, {
                data: [{
                    user_id,
                    card_id,
                    chapter: card.chapter,
                    time_since_last_review: time_since_last,
                    times_reviewed,
                    last_attempt_correct: last_correct,
                    card_difficulty: card.difficulty
                }]
            });
            prob_correct = response.data.predictions[0];
        } catch (error) {
            prob_correct = card.difficulty;
        }

        const base_xp = 10;
        const difficulty_bonus = (1 - prob_correct) * 20;
        const xp_earned = was_correct ? Math.round(base_xp + difficulty_bonus) : 0;

        // Insert review
        console.log('Inserting review:', {
            user_id,
            card_id,
            chosen_answer,
            was_correct,
            time_since_last,
            times_reviewed,
            response_time
        });
        try {
            await db.query(
                'INSERT INTO reviews (user_id, card_id, chosen_answer, was_correct, time_since_last, times_reviewed, last_correct, response_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [user_id, card_id, chosen_answer, was_correct, time_since_last, times_reviewed, was_correct, response_time]
            );
            console.log('Review inserted successfully');
        } catch (error) {
            console.error('Error inserting review:', error);
            throw error;
        }

        // Update schedule
        const next_due_time = was_correct
            ? new Date(Date.now() + (1 - prob_correct) * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 60 * 60 * 1000);

        await db.query(
            'REPLACE INTO schedules (user_id, card_id, next_due_time) VALUES (?, ?, ?)',
            [user_id, card_id, next_due_time]
        );

        res.json({
            was_correct,
            xp_earned,
            correct_answer: card.correct_answer
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Error submitting answer' });
    }
});

export default router;