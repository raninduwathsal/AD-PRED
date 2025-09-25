import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
    user_id: number;
    username: string;
    created_at: Date;
}

export interface Card extends RowDataPacket {
    card_id: number;
    video_url: string;
    question?: string;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    correct_answer: string;
    chapter: string;
    difficulty: number;
    created_at: Date;
    // Additional fields from joins
    time_since_last?: number;
    times_reviewed?: number;
    last_correct?: boolean;
}

export interface Review extends RowDataPacket {
    review_id: number;
    user_id: number;
    card_id: number;
    attempt_time: Date;
    chosen_answer: string;
    was_correct: boolean;
    time_since_last: number;
    times_reviewed: number;
    last_correct: boolean;
    response_time: number;
    confidence: number;
}

export interface Schedule extends RowDataPacket {
    user_id: number;
    card_id: number;
    next_due_time: Date;
}

export interface CardPredictionData {
    user_id: number;
    card_id: number;
    chapter: string;
    time_since_last_review: number;
    times_reviewed: number;
    last_attempt_correct: boolean;
    card_difficulty: number;
}

export interface SessionCard extends Card {
    prob_correct: number;
}