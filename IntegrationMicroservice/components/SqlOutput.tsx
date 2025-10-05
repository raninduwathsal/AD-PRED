import React, { useState, useMemo } from 'react';
import { Card } from '../types';

interface SqlOutputProps {
    cards: Card[];
}

// Function to escape single quotes for SQL strings
const escapeSqlString = (str: string) => str.replace(/'/g, "''");

const SqlOutput: React.FC<SqlOutputProps> = ({ cards }) => {
    const [copied, setCopied] = useState(false);

    const sqlScript = useMemo(() => {
        if (!cards || cards.length === 0) {
            return '';
        }

        const values = cards.map(card => 
            `('${escapeSqlString(card.video_url)}', '${escapeSqlString(card.question)}', '${escapeSqlString(card.option_1)}', '${escapeSqlString(card.option_2)}', '${escapeSqlString(card.option_3)}', '${escapeSqlString(card.option_4)}', '${escapeSqlString(card.correct_answer)}', '${escapeSqlString(card.chapter)}', ${card.difficulty})`
        ).join(',\n');

        return `INSERT INTO cards (video_url, question, option_1, option_2, option_3, option_4, correct_answer, chapter, difficulty) VALUES\n${values};`;
    }, [cards]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(sqlScript).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <section className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">SQL Output</h2>
                <button
                    onClick={handleCopy}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
                >
                    {copied ? (
                        <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                        </>
                    ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M4 3a2 2 0 012-2h6a2 2 0 012 2v2a1 1 0 11-2 0V3H6v10h3a1 1 0 110 2H6a2 2 0 01-2-2V3z" />
                        </svg>
                        Copy SQL
                        </>
                    )}
                </button>
            </div>
            <pre className="bg-slate-100 text-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>
                    {sqlScript}
                </code>
            </pre>
        </section>
    );
};

export default SqlOutput;