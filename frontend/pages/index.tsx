import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserForm } from '../components/UserForm';
import { useUserStore } from '../store/userStore';
import { login, signup } from '../lib/api';

// Simple SVG components for the Duolingo-style design
const GlobeSvg = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="#58CC02" stroke="#46A302" strokeWidth="2"/>
        <path d="M25 35c10-5 20 5 30 0s20 10 15 20-15 5-25 10-15-10-20-30z" fill="white" fillOpacity="0.8"/>
        <path d="M30 60c8 3 15-2 20 5s-5 15-15 10-8-12-5-15z" fill="white" fillOpacity="0.6"/>
        <circle cx="50" cy="25" r="3" fill="white"/>
        <circle cx="70" cy="40" r="2" fill="white"/>
        <circle cx="35" cy="75" r="2" fill="white"/>
    </svg>
);

const SignLanguageHandSvg = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none">
        <path d="M100 180c-20 0-35-15-35-35v-30c0-10 8-18 18-18s18 8 18 18v30c0 20 15 35 35 35s35-15 35-35v-40c0-30-24-54-54-54s-54 24-54 54v40c0 40 32 72 72 72s72-32 72-72" 
              stroke="#58CC02" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <circle cx="120" cy="60" r="8" fill="#58CC02"/>
        <circle cx="140" cy="80" r="6" fill="#46A302"/>
        <circle cx="160" cy="100" r="4" fill="#3D8B02"/>
    </svg>
);

export default function Home() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    const [showLoginForm, setShowLoginForm] = useState(false);
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
            setUser(null);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-duo-home text-white">
            {/* Main Content */}
            <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-16 md:flex-row md:gap-16">
                {/* Left side - Illustration */}
                <div className="flex w-full max-w-md justify-center md:w-1/2">
                    <div className="relative">
                        <GlobeSvg className="h-80 w-80 animate-bounce-subtle" />
                        <SignLanguageHandSvg className="absolute -right-8 top-1/4 h-32 w-32 opacity-80" />
                    </div>
                </div>

                {/* Right side - Content */}
                <div className="flex w-full max-w-md flex-col items-center md:w-1/2">
                    <div className="mb-8 text-center">
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">V2SL</h1>
                        <p className="text-xl font-medium md:text-2xl">
                            The free, fun, and effective way to learn sign language!
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 w-full rounded-2xl bg-duo-red-500 p-3 text-center text-white">
                            {error}
                        </div>
                    )}

                    {!showLoginForm ? (
                        <div className="flex w-full flex-col gap-3">
                            <Link
                                href="/dashboard"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowLoginForm(true);
                                    setIsSignUp(true);
                                }}
                                className="btn-duo-primary"
                            >
                                Get started
                            </Link>
                            <button
                                onClick={() => {
                                    setShowLoginForm(true);
                                    setIsSignUp(false);
                                }}
                                className="btn-duo-secondary"
                            >
                                I already have an account
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="mb-4 rounded-2xl bg-white p-6">
                                <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
                                    {isSignUp ? 'Create your profile' : 'Welcome back!'}
                                </h2>
                                <UserForm
                                    type={isSignUp ? 'signup' : 'login'}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                            
                            <div className="text-center">
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="font-medium text-white underline hover:text-gray-200"
                                >
                                    {isSignUp
                                        ? 'Already have an account?'
                                        : 'Need to create an account?'}
                                </button>
                            </div>

                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setShowLoginForm(false)}
                                    className="text-sm text-gray-300 underline hover:text-white"
                                >
                                    ← Back to start
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feature highlights */}
            <div className="w-full max-w-4xl px-4 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                        <div className="mb-3 text-4xl">🎯</div>
                        <h3 className="mb-2 text-lg font-bold">Effective</h3>
                        <p className="text-sm text-gray-200">Learn through interactive video lessons</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-3 text-4xl">🎉</div>
                        <h3 className="mb-2 text-lg font-bold">Fun</h3>
                        <p className="text-sm text-gray-200">Gamified learning experience</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-3 text-4xl">💝</div>
                        <h3 className="mb-2 text-lg font-bold">Free</h3>
                        <p className="text-sm text-gray-200">Always free to use</p>
                    </div>
                </div>
            </div>
        </main>
    );
}