import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="mt-12 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-md animate-pop-in">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm-1-9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                        An error occurred:
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;