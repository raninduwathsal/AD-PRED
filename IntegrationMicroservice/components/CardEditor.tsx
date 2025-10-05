import React, { useState, useEffect } from 'react';
import { Card } from '../types';

type CardFormData = Omit<Card, 'id' | 'difficulty'> & { difficulty: string };

interface CardEditorProps {
    card?: Card;
    onSave: (cardData: Card | Omit<Card, 'id'>) => void;
    onCancel: () => void;
}

const CardEditor: React.FC<CardEditorProps> = ({ card, onSave, onCancel }) => {
    const initialState: CardFormData = {
        video_url: '',
        question: 'What does this sign mean?',
        option_1: '',
        option_2: '',
        option_3: '',
        option_4: '',
        correct_answer: '',
        chapter: '',
        difficulty: '0.5',
    };

    const [formData, setFormData] = useState<CardFormData>(initialState);

    useEffect(() => {
        if (card) {
            setFormData({
                ...card,
                difficulty: String(card.difficulty)
            });
        } else {
            setFormData(initialState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [card]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const difficultyValue = parseFloat(formData.difficulty);
        if (isNaN(difficultyValue) || difficultyValue < 0.1 || difficultyValue > 1.0) {
            alert("Difficulty must be a number between 0.1 and 1.0");
            return;
        }

        const options = [formData.option_1, formData.option_2, formData.option_3, formData.option_4];
        if (!options.includes(formData.correct_answer)) {
            alert("The correct answer must match one of the options.");
            return;
        }

        const finalData = { ...formData, difficulty: difficultyValue };
        
        if (card) {
            onSave({ ...finalData, id: card.id });
        } else {
            onSave(finalData);
        }
    };

    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";

    return (
        <div className="bg-white p-5 mb-4 rounded-xl shadow-md animate-pop-in">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">{card ? 'Edit Card' : 'Create New Card'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Video URL</label>
                        <input type="text" name="video_url" value={formData.video_url} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Chapter</label>
                        <input type="text" name="chapter" value={formData.chapter} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-600">Question</label>
                    <input type="text" name="question" value={formData.question} onChange={handleChange} className={inputClasses} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Option 1</label>
                        <input type="text" name="option_1" value={formData.option_1} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Option 2</label>
                        <input type="text" name="option_2" value={formData.option_2} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Option 3</label>
                        <input type="text" name="option_3" value={formData.option_3} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Option 4</label>
                        <input type="text" name="option_4" value={formData.option_4} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Correct Answer</label>
                        <select name="correct_answer" value={formData.correct_answer} onChange={handleChange} className={inputClasses} required>
                            <option value="">Select correct answer</option>
                            {formData.option_1 && <option value={formData.option_1}>{formData.option_1}</option>}
                            {formData.option_2 && <option value={formData.option_2}>{formData.option_2}</option>}
                            {formData.option_3 && <option value={formData.option_3}>{formData.option_3}</option>}
                            {formData.option_4 && <option value={formData.option_4}>{formData.option_4}</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Difficulty (0.1 - 1.0)</label>
                        <input type="number" name="difficulty" value={formData.difficulty} onChange={handleChange} className={inputClasses} step="0.1" min="0.1" max="1.0" required />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-full transition">Cancel</button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition">Save</button>
                </div>
            </form>
        </div>
    );
};

export default CardEditor;