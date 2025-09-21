import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '../store/userStore';

interface UserFormProps {
    onSubmit: (username: string) => void;
    type: 'login' | 'signup';
}

export const UserForm = ({ onSubmit, type }: UserFormProps) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
            onSubmit={handleSubmit}
        >
            <h2 className="text-2xl font-bold mb-6 text-center">
                {type === 'login' ? 'Welcome Back!' : 'Get Started'}
            </h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-duo-green focus:outline-none"
                    maxLength={100}
                    required
                />
            </div>
            <motion.button
                type="submit"
                className="w-full py-3 px-4 bg-duo-green text-white font-bold rounded-lg shadow-md
                    hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-duo-green focus:ring-opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {type === 'login' ? 'Login' : 'Sign Up'}
            </motion.button>
        </motion.form>
    );
};