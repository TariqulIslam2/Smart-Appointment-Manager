'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlus, Briefcase, Users, Activity, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CreateStaffPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        service_type: '',
        daily_capacity: 5,
        status: 'available'
    });

    const serviceTypes = ['Doctor', 'Consultant', 'Support Agent', 'Nurse', 'Therapist'];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/staff');
                router.refresh();
            } else {
                setError(data.error || 'Failed to create staff');
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
                        <span className="font-medium">Back to Staff List</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <UserPlus className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Add New Staff Member
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Fill in the details below to add a new team member</p>
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
                        {/* Staff Name */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Users className="text-blue-500" size={18} />
                                Staff Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g., Dr. John Smith"
                            />
                        </div>

                        {/* Service Type */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Briefcase className="text-purple-500" size={18} />
                                Service Type
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    value={formData.service_type}
                                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                    required
                                    placeholder="service type"
                                />

                            </div>
                        </div>

                        {/* Daily Capacity */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Activity className="text-green-500" size={18} />
                                Daily Capacity
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                value={formData.daily_capacity}
                                onChange={(e) => setFormData({ ...formData, daily_capacity: parseInt(e.target.value) })}
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                <CheckCircle size={14} className="text-green-500" />
                                Maximum appointments this staff member can handle per day
                            </p>
                        </div>

                        {/* Status */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                Current Status
                            </label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="peer sr-only"
                                        name="status"
                                        value="available"
                                        checked={formData.status === 'available'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 transition-all hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500 peer-checked:animate-pulse"></div>
                                            <span className="font-medium text-gray-700">Available</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        className="peer sr-only"
                                        name="status"
                                        value="on_leave"
                                        checked={formData.status === 'on_leave'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <div className="p-4 border-2 border-gray-200 rounded-xl peer-checked:border-red-500 peer-checked:bg-red-50 transition-all hover:bg-gray-50">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="font-medium text-gray-700">On Leave</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
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
                            disabled={loading}
                            className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform ${loading
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
                                    <UserPlus size={20} />
                                    Create Staff Member
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