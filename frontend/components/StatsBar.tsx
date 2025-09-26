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
        <div className="bg-duo-green-500 border-b-4 border-duo-green-600 px-4 py-3">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section - Hearts and Streak */}
                <div className="flex items-center gap-6">
                    {/* Hearts */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-2xl transition-all duration-200 ${
                                        i < hearts ? 'scale-100 opacity-100' : 'scale-75 opacity-30'
                                    }`}
                                >
                                    ❤️
                                </span>
                            ))}
                        </div>
                        {/* Hearts count for mobile */}
                        <span className="font-bold text-white text-lg sm:hidden">
                            {hearts}
                        </span>
                        {/* Debug refill button */}
                        <button
                            onClick={handleRefillHearts}
                            className="ml-2 px-2 py-1 text-xs bg-duo-green-600 hover:bg-duo-green-700 
                                     text-white rounded transition-colors duration-200"
                            title="Refill Hearts"
                        >
                            +
                        </button>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <span className="font-bold text-white text-lg">{streak}</span>
                    </div>
                </div>

                {/* Center section - Level and XP (hidden on mobile) */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-sm text-duo-green-100">Level</div>
                        <div className="font-bold text-white text-xl">{level}</div>
                    </div>
                    
                    {/* XP Progress bar */}
                    <div className="flex flex-col items-center gap-1 min-w-[120px]">
                        <div className="text-sm text-duo-green-100">{xp} XP</div>
                        <div className="progress-duo bg-duo-green-600">
                            <div 
                                className="progress-duo-fill bg-duo-yellow-400 transition-all duration-1000"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <div className="text-xs text-duo-green-100">
                            {100 - xpProgress} to next level
                        </div>
                    </div>
                </div>

                {/* Right section - Gems/XP */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    <span className="font-bold text-white text-lg">{xp}</span>
                </div>
            </div>

            {/* Mobile XP progress */}
            <div className="mt-3 md:hidden">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-duo-green-100">Level {level}</span>
                    <span className="text-sm text-duo-green-100">{xp} XP</span>
                </div>
                <div className="progress-duo bg-duo-green-600">
                    <div 
                        className="progress-duo-fill bg-duo-yellow-400 transition-all duration-1000"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};