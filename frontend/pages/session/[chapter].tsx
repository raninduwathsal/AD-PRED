import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { VideoCard } from '../../components/VideoCard';
import { Feedback } from '../../components/Feedback';
import { StatsBar } from '../../components/StatsBar';
import { useUserStore } from '../../store/userStore';
import { Card } from '../../types';
import { startSession, submitAnswer, getUserProgress } from '../../lib/api';

export default function Session() {
    const router = useRouter();
    const { chapter } = router.query;
    const { user } = useUserStore();
    
    const [cards, setCards] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; xp: number }>({
        isCorrect: null,
        xp: 0
    });
    const [stats, setStats] = useState({ xp: 0, streak: 0, hearts: 5 });

    useEffect(() => {
        if (!user || !chapter || typeof chapter !== 'string') {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            try {
                const [sessionCards, progressData] = await Promise.all([
                    startSession(user.user_id, chapter),
                    getUserProgress(user.user_id)
                ]);

                setCards(sessionCards);
                setStats(progressData);
            } catch (error) {
                console.error('Error fetching session:', error);
                router.push('/dashboard');
            }
        };

        fetchData();
    }, [user, chapter, router]);

    const handleAnswer = async (answer: string, responseTime: number) => {
        if (!user || currentIndex >= cards.length) {
            console.error('Cannot submit answer:', { user, currentIndex, cardsLength: cards.length });
            return;
        }

        try {
            console.log('Submitting answer:', {
                userId: user.user_id,
                cardId: cards[currentIndex].card_id,
                answer,
                responseTime
            });
            const result = await submitAnswer(
                user.user_id,
                cards[currentIndex].card_id,
                answer,
                responseTime
            );

            // Create audio feedback using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (result.was_correct) {
                // Correct answer: Higher pitch, shorter duration
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            } else {
                // Wrong answer: Lower pitch, longer duration
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.4);
            }

            setFeedback({
                isCorrect: result.was_correct,
                xp: result.xp_earned
            });

            // Update local stats
            setStats(prev => ({
                ...prev,
                hearts: result.was_correct ? prev.hearts : Math.max(0, prev.hearts - 1),
                xp: prev.xp + result.xp_earned
            }));

            // Move to next card or end session
            setTimeout(() => {
                if (currentIndex + 1 >= cards.length || stats.hearts <= 0) {
                    router.push('/dashboard');
                } else {
                    setCurrentIndex(prev => prev + 1);
                    setFeedback({ isCorrect: null, xp: 0 });
                }
            }, 1500);
        } catch (error: any) {
            console.error('Error submitting answer:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setFeedback({ isCorrect: false, xp: 0 });
        }
    };

    if (!user || !chapter) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <StatsBar
                hearts={stats.hearts}
                streak={stats.streak}
                xp={stats.xp}
                onStatsUpdate={async () => {
                    if (user) {
                        const progressData = await getUserProgress(user.user_id);
                        setStats(progressData);
                    }
                }}
            />
            <div className="container mx-auto py-8">
                {cards[currentIndex] && (
                    <VideoCard
                        videoUrl={cards[currentIndex].video_url}
                        options={cards[currentIndex].options}
                        onAnswer={handleAnswer}
                        disabled={feedback.isCorrect !== null}
                    />
                )}
                <Feedback
                    isCorrect={feedback.isCorrect}
                    xpEarned={feedback.xp}
                />
            </div>
        </div>
    );
}