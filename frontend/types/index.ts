export type Card = {
    card_id: number;
    video_url: string;
    options: string[];
    prob_correct: number;
};

export type UserProgress = {
    xp: number;
    streak: number;
    hearts: number;
    due_cards_by_chapter: Record<string, number>;
};

export type Chapter = {
    name: string;
    dueCards: number;
    unlocked: boolean;
};