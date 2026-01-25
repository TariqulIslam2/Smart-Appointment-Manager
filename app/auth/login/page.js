'use client';

import { useState, Suspense } from 'react'; // Added Suspense
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Sparkles, Zap } from 'lucide-react';

// 1. Create a sub-component for the form logic
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setEmail('demo@example.com');
        setPassword('demo123');
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: 'demo@example.com',
                password: 'demo123',
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError('Demo login failed. Please try again.');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                    </div>
                </div>
                <p className="text-gray-600 text-lg">Sign in to manage your appointments</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="group">
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Password
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-purple-600 transition-colors"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all transform ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <LogIn size={20} />
                            Sign In
                        </span>
                    )}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                    </div>
                </div>

                <button
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform border-2 ${loading
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Zap size={20} />
                        Try Demo Account
                    </span>
                </button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        href="/auth/signup"
                        className="font-semibold text-blue-600 hover:text-purple-600 transition-colors"
                    >
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}

// 2. Main Page Component with Suspense Boundary
export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            <div className="w-full flex items-center justify-center p-8 bg-white">
                <Suspense fallback={<div className="text-center">Loading login form...</div>}>
                    <LoginContent />
                </Suspense>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}