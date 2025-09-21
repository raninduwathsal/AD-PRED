import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    user: {
        user_id: number;
        username: string;
    } | null;
    setUser: (user: { user_id: number; username: string } | null) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
        }),
        {
            name: 'user-storage',
        }
    )
);