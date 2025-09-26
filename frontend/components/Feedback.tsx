interface FeedbackProps {
    isCorrect: boolean | null;
    xpEarned?: number;
    message?: string;
    show?: boolean;
}

export const Feedback = ({ isCorrect, xpEarned, message, show = true }: FeedbackProps) => {
    if (isCorrect === null || !show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className={`
                w-full max-w-md mx-4 mb-8 rounded-2xl p-6 text-center transform 
                transition-all duration-300 translate-y-0 opacity-100
                ${isCorrect 
                    ? 'bg-duo-green-500 text-white' 
                    : 'bg-duo-red-500 text-white'
                }
            `}>
                <div className="text-6xl mb-4">
                    {isCorrect ? '🎉' : '💔'}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                
                {message && (
                    <p className="text-lg mb-4 opacity-90">
                        {message}
                    </p>
                )}
                
                {isCorrect && xpEarned && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl">💎</span>
                        <span className="text-xl font-bold">+{xpEarned} XP</span>
                    </div>
                )}
                
                {/* Animated progress indicator */}
                <div className="mt-4">
                    <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse w-full"></div>
                    </div>
                </div>
            </div>

            {/* Confetti effect for correct answers */}
            {isCorrect && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full animate-bounce-subtle`}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 50 + 10}%`,
                                backgroundColor: ['#58CC02', '#1CB0F6', '#CE82FF', '#FFC800'][Math.floor(Math.random() * 4)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random()}s`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};