import React, { useState, useCallback } from 'react';
import { Card } from './types';
import { generateQuestionsFromText, generateQuestionsFromFile } from './services/geminiService';
import Header from './components/Header';
import ContentInput from './components/ContentInput';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import CardList from './components/CardList';

export interface GenerateInput {
    topic?: string;
    file?: File;
}

interface SaveStatus {
    type: 'success' | 'error';
    message: string;
}

// Helper to escape single quotes for SQL strings
const escapeSqlString = (str: string) => str.replace(/'/g, "''");

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
    const [cards, setCards] = useState<Card[]>([]);

    const handleGenerate = useCallback(async (input: GenerateInput) => {
        setIsLoading(true);
        setError(null);
        setCards([]);
        setSaveStatus(null);
        try {
            let generatedCards: Card[] = [];
            if (input.topic) {
                generatedCards = await generateQuestionsFromText(input.topic);
            } else if (input.file) {
                const fileData = await fileToBase64(input.file);
                generatedCards = await generateQuestionsFromFile({
                    fileData,
                    mimeType: input.file.type,
                    fileName: input.file.name,
                });
            }
            setCards(generatedCards);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSaveToDatabase = useCallback(async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const response = await fetch('/api/cards/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards: cards.map(({ id, ...rest }) => rest) })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            const data = await response.json();
            setSaveStatus({ type: 'success', message: `Successfully saved ${data.inserted} cards to the database!` });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during the save operation.';
            console.error('Database save failed:', errorMessage);
            setSaveStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSaving(false);
        }
    }, [cards]);

    const handleUpdateCard = useCallback((updatedCard: Card) => {
        setCards(prevCards =>
            prevCards.map(card => (card.id === updatedCard.id ? updatedCard : card))
        );
    }, []);

    const handleDeleteCard = useCallback((cardId: string) => {
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    }, []);

    const handleAddCard = useCallback((newCard: Omit<Card, 'id'>) => {
        const cardWithId: Card = { ...newCard, id: crypto.randomUUID() };
        setCards(prevCards => [...prevCards, cardWithId]);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <ContentInput onGenerate={handleGenerate} disabled={isLoading || isSaving} />
                    
                    {isLoading && <Loader />}
                    {error && <ErrorMessage message={error} />}

                    {cards.length > 0 && !isLoading && (
                        <div className="mt-12 animate-slide-in-bottom">
                           <CardList 
                                cards={cards} 
                                onUpdateCard={handleUpdateCard} 
                                onDeleteCard={handleDeleteCard}
                                onAddCard={handleAddCard}
                            />
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleSaveToDatabase}
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Saving...
                                        </>
                                    ) : "Approve and Save to Database"}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {saveStatus && (
                         <div className="mt-8 max-w-2xl mx-auto animate-pop-in">
                            {saveStatus.type === 'success' ? (
                                <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded-lg shadow-md">
                                    <p className="font-semibold text-green-800">{saveStatus.message}</p>
                                </div>
                            ) : (
                                <ErrorMessage message={saveStatus.message} />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;