interface FeedbackProps {
    isCorrect: boolean | null;
    xpEarned?: number;
    message?: string;
    show?: boolean;
}

export const Feedback = ({ isCorrect, xpEarned, message, show = true }: FeedbackProps) => {
    if (isCorrect === null || !show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`
                w-full max-w-lg mx-auto rounded-3xl p-8 text-center transform 
                transition-all duration-500 scale-100 opacity-100 shadow-2xl
                ${isCorrect 
                    ? 'bg-gradient-to-br from-duo-green-500 to-duo-green-400 text-white' 
                    : 'bg-gradient-to-br from-duo-red-500 to-duo-red-400 text-white'
                }
                animate-bounce-gentle
            `}>
                {/* Large animated emoji */}
                <div className="text-8xl mb-6 animate-bounce">
                    {isCorrect ? '🎉' : '💔'}
                </div>
                
                {/* Title with better typography */}
                <h2 className="text-3xl font-bold mb-4 tracking-wide">
                    {isCorrect ? 'Excellent!' : 'Not quite right'}
                </h2>
                
                {message && (
                    <p className="text-xl mb-6 opacity-95 leading-relaxed">
                        {message}
                    </p>
                )}
                
                {/* XP Reward with animation */}
                {isCorrect && xpEarned && (
                    <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-3xl animate-pulse">💎</span>
                            <span className="text-2xl font-bold">+{xpEarned} XP</span>
                        </div>
                        <p className="text-sm opacity-80">Keep up the great work!</p>
                    </div>
                )}
                
                {/* Progress indicator with better animation */}
                <div className="mt-6">
                    <p className="text-sm opacity-80 mb-2">Moving to next question...</p>
                    <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-loading-bar"></div>
                    </div>
                </div>
            </div>

            {/* Enhanced confetti effect for correct answers */}
            {isCorrect && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="w-3 h-3 rounded-full shadow-lg"
                                style={{
                                    backgroundColor: ['#58CC02', '#1CB0F6', '#CE82FF', '#FFC800', '#FF6B6B'][Math.floor(Math.random() * 5)],
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Floating sparkles for correct answers */}
            {isCorrect && (
                <div className="fixed inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-2xl animate-float-sparkle"
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        >
                            ✨
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};