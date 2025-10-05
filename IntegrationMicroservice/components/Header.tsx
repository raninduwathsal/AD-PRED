import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md p-4">
            <div className="container mx-auto flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.01 7.5 10.5 7.5c1.13 0 2.16.42 2.96 1.12L15 7v5h-5l1.79-1.79C11.39 9.8 10.97 9.5 10.5 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c.78 0 1.47-.36 1.93-.91l1.45 1.45c-.81.99-2.04 1.66-3.48 1.66zm4.5-2.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                    Ad-Pred Learn
                </h1>
            </div>
        </header>
    );
};

export default Header;