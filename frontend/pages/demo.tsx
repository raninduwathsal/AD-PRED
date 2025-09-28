import { useState } from 'react';
import { useRouter } from 'next/router';
import { VideoCard } from '../components/VideoCard';

const demoQuestions = [
    {
        videoUrl: 'https://example.com/demo/hello.mp4',
        options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        correct: 'Hello'
    },
    {
        videoUrl: 'https://example.com/demo/thank-you.mp4',
        options: ['Sorry', 'Thank you', 'You\'re welcome', 'Excuse me'],
        correct: 'Thank you'
    },
    {
        videoUrl: 'https://example.com/demo/goodbye.mp4',
        options: ['Hello', 'Good morning', 'Goodbye', 'Good night'],
        correct: 'Goodbye'
    }
];

export default function Demo() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [isComplete, setIsComplete] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

    const handleAnswer = async (answer: string, responseTime: number) => {
        const isCorrect = answer === demoQuestions[currentQuestion].correct;
        setLastAnswerCorrect(isCorrect);
        setShowResult(true);

        if (isCorrect) {
            setScore(score + 10);
        } else {
            setHearts(Math.max(0, hearts - 1));
        }

        // Move to next question after showing result
        setTimeout(() => {
            if (currentQuestion < demoQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowResult(false);
                setLastAnswerCorrect(null);
            } else {
                setIsComplete(true);
            }
        }, 2000);

        // Return result for VideoCard compatibility
        return {
            was_correct: isCorrect,
            correct_answer: demoQuestions[currentQuestion].correct
        };
    };

    const resetDemo = () => {
        setCurrentQuestion(0);
        setScore(0);
        setHearts(5);
        setIsComplete(false);
        setShowResult(false);
        setLastAnswerCorrect(null);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-duo-green-400 to-duo-blue-400 flex items-center justify-center p-4">
                <div className="card-duo max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Lesson Complete!
                    </h1>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">XP Earned:</span>
                            <span className="font-bold text-duo-green-600">+{score}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">Hearts Left:</span>
                            <span className="font-bold text-duo-red-500">{hearts} ❤️</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">Accuracy:</span>
                            <span className="font-bold text-gray-800">
                                {Math.round((score / 30) * 100)}%
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            onClick={resetDemo}
                            className="btn-duo-primary"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-duo-secondary"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top navigation bar */}
            <nav className="bg-white border-b-2 border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <span className="text-2xl">←</span>
                    </button>
                    
                    {/* Progress bar */}
                    <div className="flex-1 mx-6">
                        <div className="progress-duo">
                            <div 
                                className="progress-duo-fill"
                                style={{ 
                                    width: `${((currentQuestion + 1) / demoQuestions.length) * 100}%` 
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Hearts */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <span 
                                key={i}
                                className={`text-xl ${i < hearts ? 'text-duo-red-500' : 'text-gray-300'}`}
                            >
                                ❤️
                            </span>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-4xl mx-auto p-4 pt-8">
                {/* Demo notice and question counter */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
                        <span className="text-blue-600">ℹ️</span>
                        <p className="text-sm text-blue-800">
                            <strong>Demo Mode:</strong> This is a practice demo with sample content
                        </p>
                    </div>
                    <p className="text-gray-600">
                        Question {currentQuestion + 1} of {demoQuestions.length}
                    </p>
                </div>

                {/* Video and answers */}
                <VideoCard
                    videoUrl={demoQuestions[currentQuestion].videoUrl}
                    options={demoQuestions[currentQuestion].options}
                    onAnswer={handleAnswer}
                    disabled={showResult}
                />

                {/* Bottom stats */}
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💎</span>
                            <span className="font-bold text-duo-blue-600">{score}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <span className="font-bold text-duo-red-500">1</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Result overlay */}
            {showResult && lastAnswerCorrect !== null && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
                    <div className={`card-duo max-w-sm w-full mx-4 text-center transform transition-all duration-500 ${
                        showResult ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}>
                        <div className="text-6xl mb-4">
                            {lastAnswerCorrect ? '🎉' : '💔'}
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 ${
                            lastAnswerCorrect ? 'text-duo-green-600' : 'text-duo-red-600'
                        }`}>
                            {lastAnswerCorrect ? 'Correct!' : 'Oops!'}
                        </h2>
                        <p className="text-gray-600">
                            {lastAnswerCorrect 
                                ? `Great job! You earned 10 XP.`
                                : `The correct answer was "${demoQuestions[currentQuestion].correct}"`
                            }
                        </p>
                        
                        {/* Loading indicator for next question */}
                        <div className="mt-6">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-duo-green-500 rounded-full animate-pulse w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No hearts warning */}
            {hearts === 0 && !isComplete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card-duo max-w-sm w-full mx-4 text-center">
                        <div className="text-6xl mb-4">💔</div>
                        <h2 className="text-2xl font-bold mb-2 text-duo-red-600">
                            Out of Hearts!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Don't worry, you can try again to keep learning.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={resetDemo}
                                className="btn-duo-primary"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="btn-duo-white text-gray-700"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}