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

        // Reset session state when starting new session
        setCards([]);
        setCurrentIndex(0);
        setFeedback({ isCorrect: null, xp: 0 });

        const fetchData = async () => {
            try {
                console.log('Starting new session for chapter:', chapter);
                const [sessionCards, progressData] = await Promise.all([
                    startSession(user.user_id, chapter),
                    getUserProgress(user.user_id)
                ]);

                console.log('Session started with cards:', sessionCards.length);
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
            throw new Error('Invalid state');
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
                    console.log('Session ended, redirecting to dashboard');
                    router.push('/dashboard');
                } else {
                    console.log('Moving to next card:', currentIndex + 1);
                    setCurrentIndex(prev => prev + 1);
                    setFeedback({ isCorrect: null, xp: 0 });
                }
            }, 1500);

            return {
                was_correct: result.was_correct,
                correct_answer: result.correct_answer
            };
        } catch (error: any) {
            console.error('Error submitting answer:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setFeedback({ isCorrect: false, xp: 0 });
            throw error;
        }
    };

    if (!user || !chapter) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-duo-green-50 to-duo-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-duo-green-500 border-t-transparent"></div>
                    <p className="text-gray-600">Loading session...</p>
                </div>
            </div>
        );
    }

    const hasPlaceholderContent = cards[currentIndex]?.video_url?.startsWith('https://example.com');
    const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-duo-green-50 to-duo-blue-50">
            {/* Enhanced Header with Progress */}
            <div className="bg-white border-b-4 border-duo-green-200 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    {/* Top row with close button and stats */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-2xl">✕</span>
                        </button>
                        
                        <div className="flex items-center gap-6">
                            {/* Hearts */}
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xl transition-all duration-300 ${
                                            i < stats.hearts ? 'scale-100 opacity-100' : 'scale-75 opacity-30 grayscale'
                                        }`}
                                    >
                                        ❤️
                                    </span>
                                ))}
                            </div>
                            
                            {/* XP */}
                            <div className="flex items-center gap-2 bg-duo-blue-50 px-3 py-2 rounded-full">
                                <span className="text-xl">💎</span>
                                <span className="font-bold text-duo-blue-600">{stats.xp}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-duo-green-500 to-duo-green-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="absolute -top-2 left-0 right-0 flex justify-between text-xs text-gray-500">
                            <span>Question {currentIndex + 1}</span>
                            <span>{cards.length} total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col min-h-[calc(100vh-120px)]">
                {/* Chapter Header */}
                <div className="text-center py-6 px-4">
                    <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-md border-2 border-duo-green-200">
                        <span className="text-2xl">🤟</span>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{chapter} Practice</h1>
                            <p className="text-sm text-gray-600">Learn sign language step by step</p>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex items-center justify-center px-4 pb-8">
                    <div className="w-full max-w-3xl">
                        {hasPlaceholderContent && (
                            <div className="mb-6">
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                                        <span className="text-amber-700 text-xl">⚠️</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-800 text-lg mb-2">Preview Mode</h3>
                                        <p className="text-amber-700">
                                            This lesson uses demo content. Real sign language videos will be available soon! 
                                            Practice with the interactive questions below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Video Card Container */}
                        {cards[currentIndex] && (
                            <div className="bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                                <VideoCard
                                    key={`${cards[currentIndex].card_id}-${currentIndex}`}
                                    videoUrl={cards[currentIndex].video_url}
                                    options={cards[currentIndex].options}
                                    onAnswer={handleAnswer}
                                    disabled={feedback.isCorrect !== null}
                                />
                            </div>
                        )}
                        
                        {/* Loading state for cards */}
                        {cards.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-6 animate-bounce">
                                    <div className="w-full h-full bg-gradient-to-r from-duo-green-500 to-duo-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl">🤟</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Preparing your lesson...</h3>
                                <p className="text-gray-500">Getting the best questions ready for you</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Feedback with better positioning */}
            <Feedback
                isCorrect={feedback.isCorrect}
                xpEarned={feedback.xp}
            />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 left-6 right-6 flex justify-between pointer-events-none">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <span className="text-xl">🏠</span>
                </button>
                
                {cards.length > 0 && (
                    <div className="pointer-events-auto bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-gray-200 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                            {currentIndex + 1} / {cards.length}
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-duo-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}