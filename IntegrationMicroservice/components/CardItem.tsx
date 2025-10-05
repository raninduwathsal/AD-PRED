import React, { useState } from 'react';
import { Card } from '../types';
import CardEditor from './CardEditor';

interface CardItemProps {
    card: Card;
    onUpdate: (card: Card) => void;
    onDelete: (cardId: string) => void;
    style?: React.CSSProperties;
}

const CardItem: React.FC<CardItemProps> = ({ card, onUpdate, onDelete, style }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedCard: Card) => {
        onUpdate(updatedCard);
        setIsEditing(false);
    };

    if (isEditing) {
        return <CardEditor card={card} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
    }

    const getOptionClasses = (option: string) => {
        const baseClasses = "py-2 px-4 rounded-lg transition-colors duration-200";
        if (option === card.correct_answer) {
            return `${baseClasses} bg-green-100 border border-green-400 text-green-800 font-semibold`;
        }
        return `${baseClasses} bg-slate-100 border border-slate-300`;
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-md transition-shadow hover:shadow-lg animate-pop-in" style={style}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-500">Video: {card.video_url}</p>
                    <p className="text-lg font-semibold mt-1 text-slate-800">{card.question}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(card.id)} className="p-2 rounded-full hover:bg-red-100 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={getOptionClasses(card.option_1)}>{card.option_1}</div>
                <div className={getOptionClasses(card.option_2)}>{card.option_2}</div>
                <div className={getOptionClasses(card.option_3)}>{card.option_3}</div>
                <div className={getOptionClasses(card.option_4)}>{card.option_4}</div>
            </div>
             <div className="mt-4 text-right text-sm font-medium text-slate-500">
                Difficulty: <span className="font-bold text-blue-500">{card.difficulty.toFixed(1)}</span>
            </div>
        </div>
    );
};

export default CardItem;