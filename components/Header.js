'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Menu,
    X,
    User,
    LogOut,
    Home,
    Calendar,
    Users,
    Scissors,
    ListChecks,
    LayoutDashboard
} from 'lucide-react';

export default function Header() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    if (status === 'loading') {
        return (
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow'}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="h-10 w-56 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl animate-pulse"></div>
                        <div className="h-10 w-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl animate-pulse hidden md:block"></div>
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl animate-pulse md:hidden"></div>
                    </div>
                </div>
            </header>
        );
    }

    if (!session) return null;

    const menuItems = [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { href: "/appointments", label: "Appointments", icon: <Calendar size={20} /> },
        { href: "/staff", label: "Staff", icon: <Users size={20} /> },
        { href: "/services", label: "Services", icon: <Scissors size={20} /> },
        { href: "/queue", label: "Queue", icon: <ListChecks size={20} /> },
    ];

    return (
        <>
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg backdrop-blur-sm' : 'bg-white shadow'}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                                <Home className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Smart Appointment Manager
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">Efficient scheduling made simple</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group"
                                >
                                    <span className="text-gray-500 group-hover:text-blue-500 transition-colors">
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}

                            {/* User Menu */}
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                    <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold">
                                        {session.user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="text-sm font-medium text-gray-900">
                                            {session.user.email?.split('@')[0]}
                                        </div>
                                        <div className="text-xs text-gray-500">{session.user.email}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                                >
                                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                                    <span className="font-medium hidden lg:block">Logout</span>
                                </button>
                            </div>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="text-gray-700" size={24} />
                            ) : (
                                <Menu className="text-gray-700" size={24} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu Panel */}
                <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Menu Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white font-bold text-xl">
                                    {session.user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{session.user.email?.split('@')[0]}</h3>
                                    <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                                </div>
                            </div>
                            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">Welcome back!</p>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-1 px-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group"
                                    >
                                        <span className="text-gray-500 group-hover:text-blue-500 transition-colors">
                                            {item.icon}
                                        </span>
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:text-red-800 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 group"
                            >
                                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu styles */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </>
    );
}