import React, { useState, useMemo } from 'react';
import { Card } from '../types';
import CardItem from './CardItem';
import CardEditor from './CardEditor';

interface CardListProps {
    cards: Card[];
    onUpdateCard: (card: Card) => void;
    onDeleteCard: (cardId: string) => void;
    onAddCard: (newCard: Omit<Card, 'id'>) => void;
}

const CardList: React.FC<CardListProps> = ({ cards, onUpdateCard, onDeleteCard, onAddCard }) => {
    const [isAdding, setIsAdding] = useState(false);

    const groupedCards = useMemo(() => {
        return cards.reduce((acc, card) => {
            (acc[card.chapter] = acc[card.chapter] || []).push(card);
            return acc;
        }, {} as Record<string, Card[]>);
    }, [cards]);

    const handleSaveNewCard = (newCardData: Omit<Card, 'id'>) => {
        onAddCard(newCardData);
        setIsAdding(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Generated Questions</h2>
                 <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Card
                </button>
            </div>

            {isAdding && (
                 <CardEditor 
                    onSave={handleSaveNewCard} 
                    onCancel={() => setIsAdding(false)} 
                />
            )}

            {Object.entries(groupedCards).map(([chapter, chapterCards], index) => (
                <div key={chapter} className="mb-10" style={{ animationDelay: `${index * 100}ms` }}>
                    <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-green-500 text-slate-700">{chapter}</h3>
                    <div className="space-y-4">
                        {chapterCards.map((card, cardIndex) => (
                            <CardItem
                                key={card.id}
                                card={card}
                                onUpdate={onUpdateCard}
                                onDelete={onDeleteCard}
                                style={{ animationDelay: `${cardIndex * 50}ms` }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardList;