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

    useEffect(() => {
        setStartTime(Date.now());
        setSelectedAnswer(null);
        setShowResult(false);
        setIsSubmitting(false);
        setServerResult(null);
        
        if (videoUrl.startsWith('https://example.com')) {
            setIsVideoReady(true);
            return;
        }

        if (videoUrl.includes('vimeo.com') && isVimeoLoaded) {
            const vimeoId = getVimeoId(videoUrl);
            console.log('Loading Vimeo video:', { vimeoId, url: videoUrl });

            if (vimeoPlayerRef.current) {
                vimeoPlayerRef.current.destroy();
            }

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
            } catch (error) {
                console.error('Error initializing Vimeo player:', error);
                setIsVideoReady(true);
            }
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
        if (!selectedAnswer) {
            return `w-full rounded-2xl border-2 border-b-4 border-gray-300 bg-white p-4 
                   text-gray-700 font-bold transition-all duration-200 
                   hover:bg-gray-50 hover:border-gray-400 focus:outline-none 
                   focus:ring-2 focus:ring-duo-blue-400 focus:ring-opacity-50
                   ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
        }
        
        if (option === selectedAnswer) {
            if (isSubmitting || !serverResult) {
                // Show loading state while waiting for server response
                return `w-full rounded-2xl border-2 border-b-4 border-yellow-400 bg-yellow-300 p-4 
                       text-yellow-800 font-bold transition-all duration-200`;
            }
            
            // Use server result to determine correct styling
            const isCorrect = serverResult.was_correct;
            return `w-full rounded-2xl border-2 border-b-4 p-4 font-bold transition-all duration-200
                   ${isCorrect 
                     ? 'border-duo-green-600 bg-duo-green-500 text-white' 
                     : 'border-duo-red-600 bg-duo-red-500 text-white'}`;
        }
        
        // Show correct answer if user was wrong
        if (showResult && serverResult && !serverResult.was_correct && option === serverResult.correct_answer) {
            return `w-full rounded-2xl border-2 border-b-4 border-duo-green-600 bg-duo-green-500 p-4 
                   text-white font-bold opacity-75`;
        }
        
        return `w-full rounded-2xl border-2 border-b-4 border-gray-300 bg-gray-200 p-4 
               text-gray-500 font-bold opacity-50`;
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
            
            <div className="w-full max-w-2xl mx-auto">
                {/* Question header */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        What does this sign mean?
                    </h2>
                    <p className="text-gray-600">Watch the video and choose the correct answer</p>
                </div>

                {/* Video container with Duolingo-style design */}
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-duo-blue-50 to-duo-green-50 border-4 border-white">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                        {videoUrl.startsWith('https://example.com') ? (
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">🤟</div>
                                <p className="text-xl font-semibold mb-2 text-gray-700">Demo Sign</p>
                                <p className="text-sm text-gray-500">{videoUrl.split('/').pop()?.replace('.mp4', '')}</p>
                            </div>
                        ) : videoUrl.includes('vimeo.com') ? (
                            <div className="relative w-full pt-[56.25%]">
                                <div id="vimeo-player" className="absolute top-0 left-0 w-full h-full"></div>
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

                {/* Answer options */}
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={disabled || selectedAnswer !== null || isSubmitting || (!isVideoReady && !videoUrl.startsWith('https://example.com'))}
                            className={getButtonStyle(option)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg">{option}</span>
                                {selectedAnswer === option && (
                                    <span className="text-2xl">
                                        {isSubmitting ? '⏳' : showResult && serverResult ? (serverResult.was_correct ? '✅' : '❌') : ''}
                                    </span>
                                )}
                                {showResult && serverResult && !serverResult.was_correct && option === serverResult.correct_answer && (
                                    <span className="text-2xl">✅</span>
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