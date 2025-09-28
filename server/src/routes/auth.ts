import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';
import { User } from '../types';

const router = Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        console.log('Signup request:', req.body);
        const { username } = req.body;
        if (!username) {
            console.log('Signup error: Username is required');
            return res.status(400).json({ error: 'Username is required' });
        }

        console.log('Attempting to create user:', username);
        const result = await db.execute(
            'INSERT INTO users (username) VALUES (?)',
            [username]
        );

        const userId = result.insertId;
        res.json({ user_id: userId, username });
    } catch (error: any) {
        console.error('Signup error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Username already taken' });
        } else {
            res.status(500).json({ error: 'Error creating user: ' + error.message });
        }
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const users = await db.query<User[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

export default router;