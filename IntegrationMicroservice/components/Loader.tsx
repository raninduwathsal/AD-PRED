import React, { useState, useEffect } from 'react';

const messages = [
    "Analyzing your content...",
    "Brewing up some brilliant questions...",
    "Consulting with the digital scribes...",
    "Structuring chapters and lessons...",
    "Almost there, polishing the options...",
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-12 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg animate-pop-in">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-slate-700 transition-opacity duration-500">
                {messages[messageIndex]}
            </p>
        </div>
    );
};

export default Loader;