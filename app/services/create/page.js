'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Scissors,
    Plus,
    Clock,
    Users,
    ArrowLeft,
    CheckCircle,
    Watch
} from 'lucide-react';

export default function CreateServicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [staffTypes, setStaffTypes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        duration: 30,
        required_staff_type: ''
    });

    const durationOptions = [15, 30, 45, 60, 90, 120];

    useEffect(() => {
        if (status === 'authenticated') {
            fetchStaffTypes();
        }
    }, [status]);

    const fetchStaffTypes = async () => {
        try {
            const response = await fetch('/api/staff/types');
            if (response.ok) {
                const data = await response.json();
                setStaffTypes(data);
            }
        } catch (error) {
            console.error('Error fetching staff types:', error);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/services');
                router.refresh();
            } else {
                setError(data.error || 'Failed to create service');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-700 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Services List</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Plus className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Add New Service
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Fill in the details below to add a new service</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Service Name */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Scissors className="text-blue-500" size={18} />
                                Service Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Haircut, Massage, Consultation"
                            />
                        </div>

                        {/* Duration */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Clock className="text-purple-500" size={18} />
                                Service Duration
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {durationOptions.map((duration) => (
                                    <label key={duration} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            className="peer sr-only"
                                            name="duration"
                                            value={duration}
                                            checked={formData.duration === duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        />
                                        <div className="p-3 border-2 border-gray-200 rounded-xl text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all hover:bg-gray-50">
                                            <div className="flex items-center justify-center gap-1">
                                                <Watch size={14} className="text-gray-500 peer-checked:text-blue-500" />
                                                <span className={`font-medium ${formData.duration === duration ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    {duration} min
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                <CheckCircle size={14} className="text-green-500" />
                                Select the approximate duration for this service
                            </p>
                        </div>

                        {/* Required Staff Type */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Users className="text-indigo-500" size={18} />
                                Required Staff Type
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                    value={formData.required_staff_type}
                                    onChange={(e) => setFormData({ ...formData, required_staff_type: e.target.value })}
                                    required
                                >
                                    <option value="">Select staff type</option>
                                    {staffTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {staffTypes.length === 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-700 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        No staff types found. Please create staff members first.
                                    </p>
                                </div>
                            )}

                            {staffTypes.length > 0 && (
                                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                    <CheckCircle size={14} className="text-green-500" />
                                    Select which type of staff member can provide this service
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || staffTypes.length === 0}
                            className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform ${loading || staffTypes.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Plus size={20} />
                                    Create Service
                                </span>
                            )}
                        </button>
                    </div>
                </div>
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