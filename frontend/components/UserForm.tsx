import { useState } from 'react';

interface UserFormProps {
    onSubmit: (username: string) => void;
    type: 'login' | 'signup';
}

export const UserForm = ({ onSubmit, type }: UserFormProps) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && !isLoading) {
            setIsLoading(true);
            try {
                await onSubmit(username.trim());
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-duo text-gray-900 placeholder-gray-500"
                    maxLength={100}
                    required
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                disabled={!username.trim() || isLoading}
                className={`btn-duo-primary ${
                    !username.trim() || isLoading
                        ? 'opacity-70 cursor-not-allowed hover:bg-duo-green-500 hover:border-duo-green-600'
                        : ''
                }`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        {type === 'login' ? 'Signing in...' : 'Creating account...'}
                    </div>
                ) : (
                    type === 'login' ? 'Sign in' : 'Create account'
                )}
            </button>
        </form>
    );
};