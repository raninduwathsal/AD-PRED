import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        Vimeo: any;
    }
}

interface VideoCardProps {
    videoUrl: string;
    options: string[];
    onAnswer: (answer: string, responseTime: number) => Promise<{ was_correct: boolean; correct_answer: string }>;
    disabled?: boolean;
}

export const VideoCard = ({ videoUrl, options, onAnswer, disabled }: VideoCardProps) => {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isVimeoLoaded, setIsVimeoLoaded] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverResult, setServerResult] = useState<{ was_correct: boolean; correct_answer: string } | null>(null);
    const vimeoPlayerRef = useRef<any>(null);

    const getVimeoId = (url: string): string => {
        const match = url.match(/(?:vimeo\.com\/)(\d+)/);
        return match ? match[1] : '';
    };

    // Cleanup effect to destroy Vimeo player on unmount
    useEffect(() => {
        return () => {
            if (vimeoPlayerRef.current) {
                try {
                    vimeoPlayerRef.current.destroy();
                    vimeoPlayerRef.current = null;
                } catch (error) {
                    console.error('Error destroying Vimeo player on cleanup:', error);
                }
            }
        };
    }, []);

    useEffect(() => {
        setStartTime(Date.now());
        setSelectedAnswer(null);
        setShowResult(false);
        setIsSubmitting(false);
        setServerResult(null);
        setIsVideoReady(false); // Reset video ready state
        
        if (videoUrl.startsWith('https://example.com')) {
            setIsVideoReady(true);
            return;
        }

        if (videoUrl.includes('vimeo.com') && isVimeoLoaded) {
            const vimeoId = getVimeoId(videoUrl);
            console.log('Loading Vimeo video:', { vimeoId, url: videoUrl });

            // Destroy existing player if it exists
            if (vimeoPlayerRef.current) {
                try {
                    vimeoPlayerRef.current.destroy();
                    vimeoPlayerRef.current = null;
                } catch (error) {
                    console.error('Error destroying previous Vimeo player:', error);
                }
            }

            // Add a small delay to ensure the DOM element is ready
            const initializePlayer = () => {
                try {
                    const player = new window.Vimeo.Player('vimeo-player', {
                        id: vimeoId,
                        responsive: true,
                        controls: false,
                        autoplay: true,
                        loop: true,
                        background: true,
                        muted: true
                    });

                    vimeoPlayerRef.current = player;

                    player.on('loaded', () => {
                        console.log('Vimeo video loaded successfully');
                        setIsVideoReady(true);
                    });

                    player.on('error', (error: any) => {
                        console.error('Vimeo player error:', error);
                        setIsVideoReady(true);
                    });

                    player.on('play', () => {
                        console.log('Vimeo video started playing');
                    });
                } catch (error) {
                    console.error('Error initializing Vimeo player:', error);
                    setIsVideoReady(true);
                }
            };

            // Use setTimeout to ensure DOM is ready
            setTimeout(initializePlayer, 100);
        }
    }, [videoUrl, isVimeoLoaded]);

    const handleAnswer = async (answer: string) => {
        if (disabled || selectedAnswer || isSubmitting) {
            console.log('Answer blocked:', { disabled, selectedAnswer, isSubmitting });
            return;
        }
        
        const shouldAllowAnswer = videoUrl.startsWith('https://example.com') || isVideoReady;
        
        if (!shouldAllowAnswer) {
            console.log('Answer blocked - video not ready:', { isVideoReady });
            return;
        }

        if (!startTime) {
            console.log('No start time recorded, using current time');
            setStartTime(Date.now());
        }

        const responseTime = (Date.now() - (startTime || Date.now())) / 1000;
        setSelectedAnswer(answer);
        setIsSubmitting(true);
        
        try {
            console.log('Submitting answer:', { answer, responseTime, videoUrl });
            const result = await onAnswer(answer, responseTime);
            setServerResult(result);
            setShowResult(true);
        } catch (error) {
            console.error('Error submitting answer:', error);
            // Reset on error
            setSelectedAnswer(null);
            setIsSubmitting(false);
        }
    };

    const getButtonStyle = (option: string) => {
        const baseStyle = "w-full rounded-2xl border-2 border-b-4 p-4 font-medium transition-all duration-300 transform";
        
        if (!selectedAnswer) {
            return `${baseStyle} border-gray-300 bg-white text-gray-700 shadow-md
                   hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg hover:scale-[1.02] 
                   focus:outline-none focus:ring-4 focus:ring-duo-blue-200
                   ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed hover:transform-none' : 'cursor-pointer'}`;
        }
        
        if (option === selectedAnswer) {
            if (isSubmitting || !serverResult) {
                // Show loading state while waiting for server response
                return `${baseStyle} border-yellow-400 bg-yellow-300 text-yellow-800 shadow-lg
                       animate-pulse`;
            }
            
            // Use server result to determine correct styling
            const isCorrect = serverResult.was_correct;
            return `${baseStyle} shadow-xl scale-[1.02]
                   ${isCorrect 
                     ? 'border-duo-green-600 bg-duo-green-500 text-white ring-4 ring-duo-green-200' 
                     : 'border-duo-red-600 bg-duo-red-500 text-white ring-4 ring-duo-red-200'}`;
        }
        
        // Show correct answer if user was wrong
        if (showResult && serverResult && !serverResult.was_correct && option === serverResult.correct_answer) {
            return `${baseStyle} border-duo-green-600 bg-duo-green-500 text-white shadow-xl
                   opacity-90 ring-4 ring-duo-green-200 animate-pulse`;
        }
        
        return `${baseStyle} border-gray-300 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed`;
    };

    return (
        <>
            <Script 
                src="https://player.vimeo.com/api/player.js"
                onLoad={() => {
                    console.log('Vimeo player script loaded');
                    setIsVimeoLoaded(true);
                }}
            />
            
            <div className="w-full max-w-2xl mx-auto p-6">
                {/* Question header with better styling */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-duo-blue-50 to-duo-green-50 rounded-2xl px-6 py-4 border-2 border-duo-blue-200 shadow-sm mb-4">
                        <span className="text-2xl">👀</span>
                        <h2 className="text-xl font-bold text-gray-800">
                            What does this sign mean?
                        </h2>
                    </div>
                    <p className="text-gray-600 text-lg">Watch carefully and choose your answer</p>
                </div>

                {/* Video container with enhanced Duolingo-style design */}
                <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-duo-blue-50 to-duo-green-50 border-4 border-white ring-4 ring-duo-blue-100">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                        {videoUrl.startsWith('https://example.com') ? (
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">🤟</div>
                                <p className="text-xl font-semibold mb-2 text-gray-700">Demo Sign</p>
                                <p className="text-sm text-gray-500">{videoUrl.split('/').pop()?.replace('.mp4', '')}</p>
                            </div>
                        ) : videoUrl.includes('vimeo.com') ? (
                            <div className="relative w-full pt-[56.25%]">
                                <div 
                                    id="vimeo-player" 
                                    key={videoUrl}
                                    className="absolute top-0 left-0 w-full h-full"
                                ></div>
                            </div>
                        ) : (
                            <video
                                src={videoUrl}
                                autoPlay
                                loop
                                controls
                                className="w-full h-full object-cover"
                                onLoadedData={() => setIsVideoReady(true)}
                                onError={(e) => console.error('Video loading error:', e)}
                            />
                        )}
                    </div>
                    
                    {/* Video loading indicator */}
                    {!isVideoReady && !videoUrl.startsWith('https://example.com') && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white rounded-full p-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-duo-green-500 border-t-transparent"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Answer options with improved design */}
                <div className="space-y-4">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={disabled || selectedAnswer !== null || isSubmitting || (!isVideoReady && !videoUrl.startsWith('https://example.com'))}
                            className={getButtonStyle(option)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold text-sm">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-lg font-medium">{option}</span>
                                </div>
                                {selectedAnswer === option && (
                                    <span className="text-2xl animate-pulse">
                                        {isSubmitting ? '⏳' : showResult && serverResult ? (serverResult.was_correct ? '✅' : '❌') : ''}
                                    </span>
                                )}
                                {showResult && serverResult && !serverResult.was_correct && option === serverResult.correct_answer && (
                                    <span className="text-2xl animate-bounce">✅</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Result feedback */}
                {showResult && selectedAnswer && serverResult && (
                    <div className="mt-6 text-center">
                        <div className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-white
                            ${serverResult.was_correct 
                              ? 'bg-duo-green-500' 
                              : 'bg-duo-red-500'}`}
                        >
                            <span className="text-2xl">
                                {serverResult.was_correct ? '🎉' : '💔'}
                            </span>
                            <span>
                                {serverResult.was_correct ? 'Correct!' : `The answer was "${serverResult.correct_answer}"`}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};