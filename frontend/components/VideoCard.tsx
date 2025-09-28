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
    const [videoError, setVideoError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [forceRefresh, setForceRefresh] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [previousUrl, setPreviousUrl] = useState<string>('');
    const [forceIframe, setForceIframe] = useState(false);
    const [useDirectEmbed, setUseDirectEmbed] = useState(false);
    const [containerKey, setContainerKey] = useState(() => `vimeo-${Date.now()}-${Math.random()}`);
    const vimeoPlayerRef = useRef<any>(null);
    const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentVideoUrlRef = useRef<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const getVimeoId = (url: string): string => {
        const match = url.match(/(?:vimeo\.com\/)(\d+)/);
        return match ? match[1] : '';
    };

    // Cleanup effect to destroy Vimeo player on unmount
    useEffect(() => {
        return () => {
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
            }
            if (progressIntervalRef.current) {
                clearTimeout(progressIntervalRef.current);
            }
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

    // Progress simulation for better UX
    const startProgressSimulation = () => {
        setLoadingProgress(0);
        let progress = 0;
        
        const simulateProgress = () => {
            progress += Math.random() * 15 + 5; // Random increment between 5-20
            if (progress > 90) progress = 90; // Cap at 90% until actual load
            
            setLoadingProgress(progress);
            
            if (progress < 90) {
                progressIntervalRef.current = setTimeout(simulateProgress, 500 + Math.random() * 1000);
            }
        };
        
        simulateProgress();
    };

    // Enhanced retry function with multiple fallback strategies
    const retryVideoLoad = () => {
        if (retryCount < 5) { // Increased retry attempts
            console.log(`🔄 Enhanced retry ${retryCount + 1} for:`, videoUrl);
            
            // Complete reset
            setIsRetrying(true);
            setVideoError(null);
            setIsVideoReady(false);
            setLoadingProgress(0);
            
            // Clear any existing intervals
            if (progressIntervalRef.current) {
                clearTimeout(progressIntervalRef.current);
            }
            
            // Destroy player and clear DOM
            if (vimeoPlayerRef.current) {
                try {
                    vimeoPlayerRef.current.destroy();
                    vimeoPlayerRef.current = null;
                } catch (error) {
                    console.error('Error destroying player during retry:', error);
                }
            }
            
            // Force DOM cleanup
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            
            // Generate new container key to force complete DOM reset
            const newKey = `vimeo-retry-${Date.now()}-${Math.random()}`;
            setContainerKey(newKey);
            console.log('🆕 Generated new container key for retry:', newKey);
            
            // Try different strategies on different attempts
            if (retryCount === 2) {
                console.log('🔧 Trying direct iframe embed approach...');
                setUseDirectEmbed(true);
            } else if (retryCount === 3) {
                console.log('🔧 Trying force iframe approach...');
                setForceIframe(true);
            }
            
            setTimeout(() => {
                setIsRetrying(false);
                setRetryCount(prev => prev + 1);
                setForceRefresh(prev => prev + 1); // Force re-render
            }, 1500);
        } else {
            console.log('Max retries reached, allowing continue anyway');
            setIsVideoReady(true);
        }
    };

    // Complete reset and reinitialize when videoUrl changes
    useEffect(() => {
        console.log('🎥 VideoCard: videoUrl changed to:', videoUrl);
        console.log('🔄 Previous URL was:', previousUrl);
        
        setPreviousUrl(videoUrl);
        
        // Reset all states for new video
        setStartTime(Date.now());
        setSelectedAnswer(null);
        setShowResult(false);
        setIsSubmitting(false);
        setServerResult(null);
        setIsVideoReady(false);
        setVideoError(null);
        setLoadingProgress(0);
        setUseDirectEmbed(false);
        setForceIframe(false);
        
        // Reset retry count only for different videos
        if (previousUrl !== videoUrl) {
            setRetryCount(0);
            // Generate new container key to force complete DOM reset
            const newKey = `vimeo-${Date.now()}-${Math.random()}`;
            setContainerKey(newKey);
            console.log('🆕 Generated new container key for video change:', newKey);
        }
        
        // Clear any existing intervals/timeouts
        if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
        }
        if (progressIntervalRef.current) {
            clearTimeout(progressIntervalRef.current);
        }

        // Always destroy existing player when URL changes
        if (vimeoPlayerRef.current) {
            try {
                console.log('Destroying existing Vimeo player for new video');
                vimeoPlayerRef.current.destroy();
                vimeoPlayerRef.current = null;
            } catch (error) {
                console.error('Error destroying previous Vimeo player:', error);
            }
        }
        
        if (videoUrl.startsWith('https://example.com')) {
            setIsVideoReady(true);
            return;
        }

        // Wait for both Vimeo script and DOM to be ready
        if (videoUrl.includes('vimeo.com') && isVimeoLoaded) {
            const vimeoId = getVimeoId(videoUrl);
            console.log('Initializing new Vimeo video:', { vimeoId, url: videoUrl });

            const initializePlayer = () => {
                try {
                    const playerId = containerKey;
                    const playerElement = document.getElementById(playerId);
                    
                    if (!playerElement) {
                        console.error(`Player element ${playerId} not found, DOM may not be ready`);
                        // Retry after DOM update
                        setTimeout(() => {
                            const retryElement = document.getElementById(playerId);
                            if (!retryElement) {
                                console.error(`Still no player element after retry: ${playerId}`);
                                setVideoError('Video container not found');
                                return;
                            }
                            initializePlayer();
                        }, 200);
                        return;
                    }

                    console.log('🚀 Creating enhanced Vimeo player:', { vimeoId, playerId, element: playerElement });
                    
                    // Start progress simulation
                    startProgressSimulation();
                    
                    // Enhanced Vimeo player options for better performance
                    const playerOptions = {
                        id: vimeoId,
                        responsive: true,
                        controls: false,
                        autoplay: true,
                        loop: true,
                        background: true,
                        muted: true,
                        // Performance optimizations
                        dnt: true, // Do not track - may help with GDPR
                        quality: 'auto', // Let Vimeo decide quality
                        speed: true, // Enable speed controls
                        keyboard: false, // Disable keyboard shortcuts
                        pip: false, // Disable picture-in-picture
                        title: false, // Hide title
                        byline: false, // Hide byline
                        portrait: false, // Hide portrait
                    };

                    const player = new window.Vimeo.Player(playerId, playerOptions);
                    vimeoPlayerRef.current = player;

                    // Extended timeout for slow connections
                    const loadTimeout = setTimeout(() => {
                        console.warn('⏰ Video load timeout for:', videoUrl);
                        setVideoError('Video loading is taking longer than expected');
                        // Don't mark as ready yet, let user retry
                        if (retryCount < 3) {
                            console.log('Auto-retrying due to timeout...');
                            retryVideoLoad();
                        } else {
                            setIsVideoReady(true);
                        }
                    }, 20000); // Increased to 20 seconds

                    player.on('loaded', () => {
                        clearTimeout(loadTimeout);
                        if (progressIntervalRef.current) {
                            clearTimeout(progressIntervalRef.current);
                        }
                        setLoadingProgress(100);
                        console.log('✅ Vimeo video loaded successfully:', videoUrl);
                        setIsVideoReady(true);
                        setVideoError(null);
                        setRetryCount(0); // Reset on success
                    });

                    player.on('error', (error: any) => {
                        clearTimeout(loadTimeout);
                        if (progressIntervalRef.current) {
                            clearTimeout(progressIntervalRef.current);
                        }
                        console.error('❌ Vimeo player error:', error, 'for URL:', videoUrl);
                        const errorMsg = error.message || error.name || 'Unknown video error';
                        setVideoError(`Video error: ${errorMsg}`);
                        
                        // Auto-retry for certain errors
                        if (retryCount < 2 && (errorMsg.includes('network') || errorMsg.includes('timeout'))) {
                            console.log('🔄 Auto-retrying due to network error...');
                            setTimeout(() => retryVideoLoad(), 2000);
                        }
                    });

                    player.on('play', () => {
                        console.log('▶️ Video started playing:', videoUrl);
                        setVideoError(null);
                        setLoadingProgress(100);
                    });

                    player.on('bufferstart', () => {
                        console.log('⏳ Video buffering started');
                    });

                    player.on('bufferend', () => {
                        console.log('⚡ Video buffering ended');
                    });

                } catch (error) {
                    console.error('💥 Failed to create Vimeo player:', error);
                    setVideoError(`Player creation failed: ${(error as Error).message}`);
                }
            };

            // Give DOM time to update, then initialize
            initTimeoutRef.current = setTimeout(initializePlayer, 300);
        }
    }, [videoUrl, isVimeoLoaded, forceRefresh]);

    // Simplified retry effect
    useEffect(() => {
        if (retryCount > 0) {
            console.log('🔄 Retry attempt:', retryCount, 'for URL:', videoUrl);
        }
    }, [retryCount]);

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
                strategy="beforeInteractive"
                onLoad={() => {
                    console.log('Vimeo player script loaded');
                    // Add a small delay to ensure the script is fully available
                    setTimeout(() => {
                        if (typeof window !== 'undefined' && window.Vimeo) {
                            setIsVimeoLoaded(true);
                        } else {
                            console.warn('Vimeo script loaded but Vimeo object not available');
                            // Try to check again after a short delay
                            setTimeout(() => {
                                if (window.Vimeo) {
                                    setIsVimeoLoaded(true);
                                } else {
                                    console.error('Vimeo script failed to initialize properly');
                                    setVideoError('Video player script failed to load');
                                }
                            }, 1000);
                        }
                    }, 100);
                }}
                onError={(error) => {
                    console.error('Failed to load Vimeo script:', error);
                    setVideoError('Video player script failed to load');
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
                        {/* Manual refresh button */}
                        {!videoUrl.startsWith('https://example.com') && (
                            <button
                                onClick={() => {
                                    console.log('🔄 Manual refresh button clicked for:', videoUrl);
                                    
                                    // Complete reset
                                    setRetryCount(0);
                                    setVideoError(null);
                                    setIsVideoReady(false);
                                    
                                    if (vimeoPlayerRef.current) {
                                        try {
                                            vimeoPlayerRef.current.destroy();
                                            vimeoPlayerRef.current = null;
                                        } catch (error) {
                                            console.error('Error destroying player during manual refresh:', error);
                                        }
                                    }
                                    
                                    // Force DOM cleanup
                                    if (containerRef.current) {
                                        containerRef.current.innerHTML = '';
                                    }
                                    
                                    // Generate new container key for complete reset
                                    const newKey = `vimeo-refresh-${Date.now()}-${Math.random()}`;
                                    setContainerKey(newKey);
                                    console.log('🔄 Manual refresh: new container key:', newKey);
                                    
                                    // Force complete re-render
                                    setForceRefresh(prev => prev + 1);
                                    currentVideoUrlRef.current = ''; // Force URL change detection
                                }}
                                className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all hover:scale-110"
                                title="Refresh video"
                            >
                                <span className="text-lg">🔄</span>
                            </button>
                        )}

                        {videoUrl.startsWith('https://example.com') ? (
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">🤟</div>
                                <p className="text-xl font-semibold mb-2 text-gray-700">Demo Sign</p>
                                <p className="text-sm text-gray-500">{videoUrl.split('/').pop()?.replace('.mp4', '')}</p>
                            </div>
                        ) : videoUrl.includes('vimeo.com') ? (
                            <div className="relative w-full pt-[56.25%]" key={`container-${videoUrl}-${forceRefresh}`}>
                                {(useDirectEmbed || forceIframe) ? (
                                    // Fallback: Direct iframe embed
                                    <iframe
                                        src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}?autoplay=1&loop=1&title=0&byline=0&portrait=0&muted=1&controls=0`}
                                        className="absolute top-0 left-0 w-full h-full"
                                        frameBorder="0"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        onLoad={() => {
                                            console.log('🎯 Fallback iframe loaded successfully');
                                            setIsVideoReady(true);
                                            setVideoError(null);
                                            setLoadingProgress(100);
                                        }}
                                        onError={() => {
                                            console.error('❌ Fallback iframe failed to load');
                                            setVideoError('Both player methods failed');
                                        }}
                                    />
                                ) : (
                                    // Primary: Vimeo Player API
                                    <div 
                                        ref={containerRef}
                                        id={containerKey}
                                        key={containerKey}
                                        className="absolute top-0 left-0 w-full h-full bg-black"
                                    ></div>
                                )}
                                
                                {/* Debug overlay */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                                        ID: {getVimeoId(videoUrl)} | Method: {useDirectEmbed || forceIframe ? 'iframe' : 'API'} | Retry: {retryCount}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <video
                                src={videoUrl}
                                autoPlay
                                loop
                                controls
                                className="w-full h-full object-cover"
                                onLoadedData={() => setIsVideoReady(true)}
                                onError={(e) => {
                                    console.error('Video loading error:', e);
                                    setVideoError('Video file could not be loaded');
                                }}
                            />
                        )}
                    </div>
                    
                    {/* Enhanced video loading indicator with progress */}
                    {!isVideoReady && !videoUrl.startsWith('https://example.com') && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl">
                                {isRetrying ? (
                                    <>
                                        <div className="text-4xl mb-4">🔄</div>
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-duo-blue-500 border-t-transparent mx-auto mb-4"></div>
                                        <p className="text-gray-700 font-bold text-lg">Retrying Connection...</p>
                                        <p className="text-sm text-gray-500 mt-2">Attempt {retryCount + 1} of 5</p>
                                    </>
                                ) : videoError ? (
                                    <>
                                        <div className="text-5xl mb-4">⚠️</div>
                                        <p className="text-gray-800 font-bold text-lg mb-2">Video Loading Issue</p>
                                        <div className="bg-red-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-red-700">{videoError}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {retryCount < 5 && (
                                                <button
                                                    onClick={retryVideoLoad}
                                                    className="flex-1 px-4 py-3 bg-duo-blue-500 text-white rounded-xl hover:bg-duo-blue-600 transition-colors font-bold"
                                                >
                                                    🔄 Try Again ({5 - retryCount} left)
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setIsVideoReady(true)}
                                                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-bold"
                                            >
                                                ⏭️ Continue
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-5xl mb-4">🎥</div>
                                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-duo-green-500 border-t-transparent mx-auto mb-4"></div>
                                        <p className="text-gray-800 font-bold text-lg">Loading Video...</p>
                                        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                                        
                                        {/* Progress bar */}
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-duo-green-500 to-duo-blue-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(loadingProgress, 90)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {Math.round(loadingProgress)}% loaded
                                            </p>
                                        </div>

                                        {/* Quick retry option */}
                                        <button
                                            onClick={retryVideoLoad}
                                            className="mt-4 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            Taking too long? Click to retry
                                        </button>
                                    </>
                                )}
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