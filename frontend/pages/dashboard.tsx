import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChapterGrid } from '../components/ChapterGrid';
import { StatsBar } from '../components/StatsBar';
import { useUserStore } from '../store/userStore';
import { getChapters, getUserProgress } from '../lib/api';
import { Chapter } from '../types';

export default function Dashboard() {
    const router = useRouter();
    const { user } = useUserStore();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [stats, setStats] = useState({ xp: 0, streak: 0, hearts: 5 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) {
                    router.replace('/');
                    return;
                }
    
                const [chaptersData, progressData] = await Promise.all([
                    getChapters(),
                    getUserProgress(user.user_id)
                ]);
    
                const level = Math.floor(progressData.xp / 100) + 1;
                const chapterList = chaptersData.map((name: string, index: number) => ({
                    name,
                    dueCards: progressData.due_cards_by_chapter[name] || 0,
                    unlocked: level >= index + 1
                }));
    
                setChapters(chapterList);
                setStats(progressData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                const { useUserStore } = await import('../store/userStore');
                useUserStore.getState().setUser(null);
                router.replace('/');
            }
        };
    
        fetchData();
    }, [user, router]);

    const handleSelectChapter = (chapter: string) => {
        router.push(`/session/${encodeURIComponent(chapter)}`);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <StatsBar
                hearts={stats.hearts}
                streak={stats.streak}
                xp={stats.xp}
            />
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Choose a Chapter</h1>
                <ChapterGrid
                    chapters={chapters}
                    onSelectChapter={handleSelectChapter}
                />
            </div>
        </div>
    );
}