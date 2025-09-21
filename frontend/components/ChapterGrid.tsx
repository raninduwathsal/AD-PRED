import { motion } from 'framer-motion';
import { Chapter } from '../types';

interface ChapterGridProps {
    chapters: Chapter[];
    onSelectChapter: (chapter: string) => void;
}

export const ChapterGrid = ({ chapters, onSelectChapter }: ChapterGridProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {chapters.map((chapter) => (
                <motion.button
                    key={chapter.name}
                    onClick={() => chapter.unlocked && onSelectChapter(chapter.name)}
                    className={`relative aspect-square rounded-2xl shadow-lg overflow-hidden
                        ${chapter.unlocked
                            ? 'bg-white hover:shadow-xl cursor-pointer'
                            : 'bg-gray-200 cursor-not-allowed'}`}
                    whileHover={chapter.unlocked ? { scale: 1.05 } : undefined}
                    whileTap={chapter.unlocked ? { scale: 0.95 } : undefined}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <h3 className="text-xl font-bold mb-2">{chapter.name}</h3>
                        {chapter.dueCards > 0 && (
                            <span className="text-duo-blue font-semibold">
                                {chapter.dueCards} cards due
                            </span>
                        )}
                        {!chapter.unlocked && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white">🔒 Locked</span>
                            </div>
                        )}
                    </div>
                </motion.button>
            ))}
        </div>
    );
};