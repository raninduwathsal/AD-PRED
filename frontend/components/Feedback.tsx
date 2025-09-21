import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackProps {
    isCorrect: boolean | null;
    xpEarned?: number;
}

export const Feedback = ({ isCorrect, xpEarned }: FeedbackProps) => {
    if (isCorrect === null) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 
                    px-6 py-4 rounded-lg shadow-lg text-white text-lg font-bold
                    ${isCorrect ? 'bg-duo-green' : 'bg-duo-red'}`}
            >
                <div className="flex items-center gap-4">
                    {isCorrect ? (
                        <>
                            <span>Correct! 🎉</span>
                            {xpEarned && <span>+{xpEarned} XP</span>}
                        </>
                    ) : (
                        <span>Incorrect ❌</span>
                    )}
                </div>
            </motion.div>
            {isCorrect && (
                <motion.div
                    className="fixed inset-0 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                >
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#58CC02', '#1CB0F6', '#CE82FF'][Math.floor(Math.random() * 3)]
                            }}
                            animate={{
                                y: [0, -200],
                                x: [0, (Math.random() - 0.5) * 200],
                                opacity: [1, 0],
                            }}
                            transition={{
                                duration: 1,
                                delay: Math.random() * 0.3,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};