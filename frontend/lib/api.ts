import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
});

export const signup = async (username: string) => {
    const { data } = await api.post('/signup', { username });
    return data;
};

export const login = async (username: string) => {
    const { data } = await api.post('/login', { username });
    return data;
};

export const getChapters = async () => {
    const { data } = await api.get('/chapters');
    return data;
};

export const startSession = async (user_id: number, chapter: string) => {
    const { data } = await api.post('/start-session', { user_id, chapter });
    return data;
};

export const submitAnswer = async (
    user_id: number,
    card_id: number,
    chosen_answer: string,
    response_time: number
) => {
    const { data } = await api.post('/submit-answer', {
        user_id,
        card_id,
        chosen_answer,
        response_time
    });
    return data;
};

export const getUserProgress = async (user_id: number) => {
    const { data } = await api.get(`/user-progress/${user_id}`);
    return data;
};

export const refillHearts = async (user_id: number) => {
    const { data } = await api.post(`/refill-hearts/${user_id}`);
    return data;
};