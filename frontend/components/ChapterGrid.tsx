import { Chapter } from '../types';

interface ChapterGridProps {
    chapters: Chapter[];
    onSelectChapter: (chapter: string) => void;
}

// Sign Language Chapter icons mapping with ASL theme
const chapterIcons: { [key: string]: string } = {
    'Basics': '👋',
    'Greetings': '🤝',
    'Food Signs': '🍎',
    'Family': '👨‍👩‍👧‍👦',
    'Numbers': '🔢',
    'Colors': '🌈',
    'Animals': '🐕',
    'Weather': '☀️',
    'Time': '⏰',
    'Travel': '✈️'
};

// Enhanced sign language descriptions
const chapterDescriptions: { [key: string]: string } = {
    'Basics': 'Essential hand shapes & movements',
    'Greetings': 'Hello, goodbye, nice to meet you',
    'Food Signs': 'Common food & drink signs',
    'Family': 'Family members & relationships',
    'Numbers': 'Counting & number systems',
    'Colors': 'Color vocabulary in ASL',
    'Animals': 'Animal signs & characteristics',
    'Weather': 'Weather conditions & seasons',
    'Time': 'Time, dates & scheduling',
    'Travel': 'Travel & transportation signs'
};

// Duolingo-style path positions for lessons
const getPathPosition = (index: number) => {
    const positions = [
        'left-0',           // 0
        'left-1/4',         // 1  
        'left-1/2',         // 2
        'left-3/4',         // 3
        'left-full',        // 4
        'left-3/4',         // 5
        'left-1/2',         // 6
        'left-1/4',         // 7
    ];
    return positions[index % positions.length];
};

export const ChapterGrid = ({ chapters, onSelectChapter }: ChapterGridProps) => {
    return (
        <div className="relative max-w-3xl mx-auto">
            {/* Learning path container */}
            <div className="flex flex-col items-center gap-12 py-8">
                {chapters.map((chapter, index) => {
                    const icon = chapterIcons[chapter.name] || '📖';
                    const description = chapterDescriptions[chapter.name] || 'Learn new signs';
                    const isUnlocked = chapter.unlocked;
                    const hasDueCards = chapter.dueCards > 0;
                    
                    return (
                        <div
                            key={chapter.name}
                            className={`relative ${getPathPosition(index)} transform -translate-x-1/2`}
                        >
                            {/* Enhanced Connecting line */}
                            {index > 0 && (
                                <div className="absolute -top-12 left-1/2 w-1 h-12 bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full transform -translate-x-1/2"></div>
                            )}
                            
                            {/* Enhanced Lesson tile */}
                            <button
                                onClick={() => isUnlocked && onSelectChapter(chapter.name)}
                                disabled={!isUnlocked}
                                className={`
                                    group relative flex h-24 w-24 items-center justify-center rounded-full border-b-8 
                                    transition-all duration-300 hover:brightness-110 focus:outline-none focus:ring-4 
                                    ${isUnlocked
                                        ? hasDueCards
                                            ? 'border-blue-700 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl cursor-pointer focus:ring-blue-200'
                                            : 'border-green-700 bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-xl cursor-pointer focus:ring-green-200'
                                        : 'border-gray-500 bg-gradient-to-br from-gray-400 to-gray-500 shadow-md cursor-not-allowed'
                                    }
                                `}
                            >
                                {/* Lesson icon */}
                                <div className="text-3xl text-white group-hover:scale-125 transition-transform duration-200">
                                    {isUnlocked ? icon : '🔒'}
                                </div>

                                {/* Progress indicator for completed lessons */}
                                {isUnlocked && !hasDueCards && (
                                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-duo-yellow-500 border-2 border-white flex items-center justify-center">
                                        <span className="text-xs text-white">✓</span>
                                    </div>
                                )}

                                {/* Due cards indicator */}
                                {hasDueCards && (
                                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-duo-red-500 border-2 border-white flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">{chapter.dueCards}</span>
                                    </div>
                                )}
                            </button>

                            {/* Enhanced Chapter info card */}
                            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64">
                                <div className={`
                                    rounded-2xl px-4 py-3 text-center border backdrop-blur-sm
                                    ${isUnlocked 
                                        ? 'bg-white/95 text-gray-800 shadow-lg border-indigo-200/50' 
                                        : 'bg-gray-100/95 text-gray-500 border-gray-200/50'
                                    }
                                `}>
                                    <div className="font-bold text-lg">{chapter.name}</div>
                                    <div className="text-sm opacity-75 mt-1">{description}</div>
                                    {hasDueCards && (
                                        <div className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 px-2 py-1 rounded-full inline-block">
                                            📚 Review time! ({chapter.dueCards} cards)
                                        </div>
                                    )}
                                </div>
                                
                                {/* Enhanced Tooltip arrow */}
                                <div className={`
                                    absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45
                                    ${isUnlocked ? 'bg-white/95 border-l border-t border-indigo-200/50' : 'bg-gray-100/95 border-l border-t border-gray-200/50'}
                                `}></div>
                            </div>

                            {/* Enhanced Hover label for active lessons */}
                            {isUnlocked && (
                                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:scale-110">
                                    <div className={`
                                        rounded-xl px-4 py-2 text-sm font-bold text-white whitespace-nowrap shadow-lg
                                        ${hasDueCards 
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                            : 'bg-gradient-to-r from-green-500 to-green-600'
                                        }
                                    `}>
                                        <div className="flex items-center gap-2">
                                            <span>{hasDueCards ? '📚' : '🎯'}</span>
                                            <span>{hasDueCards ? 'Review' : 'Start'} +10 XP</span>
                                        </div>
                                    </div>
                                    <div className={`
                                        absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent
                                        ${hasDueCards ? 'border-t-blue-600' : 'border-t-green-600'}
                                    `}></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Enhanced Path completion indicator */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200/50 px-6 py-4 text-sm shadow-lg backdrop-blur-sm">
                    <div className="text-2xl animate-bounce-subtle">�</div>
                    <div>
                        <div className="font-bold text-gray-800">
                            {chapters.filter(c => c.unlocked && !c.dueCards).length} / {chapters.length} Chapters Mastered
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            Keep practicing to unlock new content!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};