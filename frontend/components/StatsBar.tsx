import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { refillHearts } from '../lib/api';

interface StatsBarProps {
    hearts: number;
    streak: number;
    xp: number;
    level?: number;
    onStatsUpdate?: () => void;
}

export const StatsBar = ({ hearts, streak, xp, level = Math.floor(xp / 100) + 1, onStatsUpdate }: StatsBarProps) => {
    const xpProgress = xp % 100;
    const { user } = useUserStore();

    const handleRefillHearts = async () => {
        if (!user) return;
        try {
            await refillHearts(user.user_id);
            if (onStatsUpdate) {
                onStatsUpdate();
            }
        } catch (error) {
            console.error('Error refilling hearts:', error);
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={false}
                                animate={i < hearts ? { scale: [1.2, 1] } : { scale: 1, opacity: 0.3 }}
                                className="text-2xl"
                            >
                                ❤️
                            </motion.span>
                        ))}
                    </div>
                    {/* Debug Refill Button */}
                    <button
                        onClick={handleRefillHearts}
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                        title="Debug: Refill Hearts"
                    >
                        🔄
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <span className="font-bold">{streak}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-lg">✨</span>
                    <span className="font-bold">{xp}</span>
                </div>
                <div className="relative w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-duo-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <span className="text-sm font-semibold">Level {level}</span>
            </div>
        </div>
    );
};