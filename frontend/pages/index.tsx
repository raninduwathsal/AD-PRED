import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserForm } from '../components/UserForm';
import { useUserStore } from '../store/userStore';
import { login, signup } from '../lib/api';

export default function Home() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    const { user, setUser } = useUserStore();

    useEffect(() => {
        if (user) {
            router.replace('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (username: string) => {
        try {
            setError('');
            const data = await (isSignUp ? signup(username) : login(username));
            if (!data || !data.user_id) {
                throw new Error('Invalid response from server');
            }
            setUser(data);
            router.replace('/dashboard');
        } catch (error: any) {
            console.error('Login/Signup error:', error);
            setError(error.response?.data?.error || 'Something went wrong');
            setUser(null); // Clear any existing user data
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">V2SL</h1>
                <p className="text-gray-600">Learn sign language through interactive videos</p>
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            <UserForm
                type={isSignUp ? 'signup' : 'login'}
                onSubmit={handleSubmit}
            />

            <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-4 text-duo-blue hover:underline"
            >
                {isSignUp
                    ? 'Already have an account? Log in'
                    : 'New here? Create an account'}
            </button>
        </div>
    );
}