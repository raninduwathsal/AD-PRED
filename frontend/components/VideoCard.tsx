import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoCardProps {
    videoUrl: string;
    options: string[];
    onAnswer: (answer: string, responseTime: number) => void;
    disabled?: boolean;
}

export const VideoCard = ({ videoUrl, options, onAnswer, disabled }: VideoCardProps) => {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        setStartTime(Date.now());
        // For example.com videos, set ready immediately
        if (videoUrl.startsWith('https://example.com')) {
            setIsVideoReady(true);
        } else {
            setIsVideoReady(false);
        }
    }, [videoUrl]);

    const handleAnswer = (answer: string) => {
        if (disabled) {
            console.log('Answer blocked - disabled:', { disabled });
            return;
        }
        
        // For example.com videos, always allow answers
        const shouldAllowAnswer = videoUrl.startsWith('https://example.com') || isVideoReady;
        
        if (!shouldAllowAnswer) {
            console.log('Answer blocked - video not ready:', { isVideoReady });
            return;
        }

        if (!startTime) {
            console.log('No start time recorded, using current time');
            setStartTime(Date.now());
            return;
        }

        const responseTime = (Date.now() - startTime) / 1000;
        console.log('Submitting answer:', { answer, responseTime, videoUrl });
        onAnswer(answer, responseTime);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="relative aspect-video mb-6 rounded-lg overflow-hidden shadow-lg">
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                    {videoUrl.startsWith('https://example.com') ? (
                        // Placeholder for demo videos
                        <div className="text-center p-4">
                            <p className="text-lg font-semibold mb-2">Demo Video Placeholder</p>
                            <p className="text-sm text-gray-600">{videoUrl.split('/').pop()?.replace('.mp4', '')}</p>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={disabled || (!isVideoReady && !videoUrl.startsWith('https://example.com'))}
                        className={`p-4 rounded-lg text-lg font-semibold transition
                            ${disabled || (!isVideoReady && !videoUrl.startsWith('https://example.com'))
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 active:bg-gray-100'}
                            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-duo-blue`}
                        whileHover={{ scale: disabled ? 1 : 1.02 }}
                        whileTap={{ scale: disabled ? 1 : 0.98 }}
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};