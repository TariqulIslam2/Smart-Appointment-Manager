'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    UserPlus, Briefcase, Users, Activity,
    ArrowLeft, CheckCircle, Save, Shield,
    MessageSquare, Calendar, AlertCircle,
    Zap, Bell, UserCheck, UserX
} from 'lucide-react';

export default function EditStaffPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const staffId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        service_type: '',
        daily_capacity: 5,
        status: 'available'
    });

    const serviceTypes = [
        { value: 'Doctor', icon: <Shield className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
        { value: 'Consultant', icon: <Briefcase className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
        { value: 'Support Agent', icon: <MessageSquare className="w-5 h-5" />, color: 'from-green-500 to-emerald-600' },
        { value: 'Nurse', icon: <Activity className="w-5 h-5" />, color: 'from-rose-500 to-pink-600' },
        { value: 'Therapist', icon: <Users className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' }
    ];

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated' && staffId) {
            fetchStaffData();
        }
    }, [status, staffId, router]);

    const fetchStaffData = async () => {
        try {
            const response = await fetch(`/api/staff/${staffId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name,
                    service_type: data.service_type,
                    daily_capacity: data.daily_capacity,
                    status: data.status
                });
            } else {
                setError('Failed to load staff data');
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            setError('Error loading staff data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        // Validate form
        if (!formData.name.trim()) {
            setError('Name is required');
            setSaving(false);
            return;
        }

        if (!formData.service_type) {
            setError('Service type is required');
            setSaving(false);
            return;
        }

        if (formData.daily_capacity < 1 || formData.daily_capacity > 20) {
            setError('Daily capacity must be between 1 and 20');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`/api/staff/${staffId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Staff updated successfully!');
                setTimeout(() => {
                    router.push('/staff');
                    router.refresh();
                }, 1500);
            } else {
                setError(data.error || 'Failed to update staff');
            }
        } catch (error) {
            console.error('Error updating staff:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getServiceIcon = (type) => {
        const service = serviceTypes.find(s => s.value === type);
        return service ? service.icon : <Briefcase className="w-5 h-5" />;
    };

    const getServiceColor = (type) => {
        const service = serviceTypes.find(s => s.value === type);
        return service ? service.color : 'from-gray-500 to-gray-600';
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        {/* <Users className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> */}
                    </div>
                    {/* <p className="text-gray-700 font-medium text-lg">Loading staff information...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the details</p> */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/staff"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group transition-all mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Staff List</span>
                    </Link>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <UserPlus className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Edit Staff Member
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">Update staff information and preferences</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Editing ID: #{staffId}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                            {/* Messages */}
                            {error && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-l-4 border-rose-500 rounded-r-lg animate-shake">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                        <p className="text-rose-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-r-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <p className="text-emerald-700 font-medium">{success}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Staff Name */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Users className="text-blue-500" size={18} />
                                        Staff Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter staff full name"
                                    />
                                </div>

                                {/* Service Type */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Briefcase className="text-purple-500" size={18} />
                                        Service Type
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {serviceTypes.map((service) => (
                                            <button
                                                key={service.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, service_type: service.value })}
                                                className={`p-4 rounded-xl border-2 transition-all transform ${formData.service_type === service.value
                                                    ? `border-transparent bg-gradient-to-r ${service.color} text-white shadow-lg scale-105`
                                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 hover:scale-102'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={formData.service_type === service.value ? 'text-white' : 'text-gray-600'}>
                                                        {service.icon}
                                                    </div>
                                                    <span className="text-sm font-medium">{service.value}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Daily Capacity */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Activity className="text-green-500" size={18} />
                                            Daily Capacity
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {formData.daily_capacity}
                                            </span>
                                            <span className="text-sm text-gray-600">appointments</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={formData.daily_capacity}
                                            onChange={(e) => setFormData({ ...formData, daily_capacity: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:shadow-md"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 px-1">
                                            <span>Min: 1</span>
                                            <span>Recommended: 5</span>
                                            <span>Max: 5</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                        Maximum appointments this staff member can handle per day. Adjust based on appointment duration and workload.
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Calendar className="text-amber-500" size={18} />
                                        Availability Status
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'available' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.status === 'available'
                                                ? 'border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <UserCheck className="w-5 h-5" />
                                                    <div>
                                                        <div className="font-semibold">Available</div>
                                                        <div className="text-sm opacity-90">Ready to accept appointments</div>
                                                    </div>
                                                </div>
                                                {formData.status === 'available' && (
                                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'on_leave' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.status === 'on_leave'
                                                ? 'border-transparent bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <UserX className="w-5 h-5" />
                                                    <div>
                                                        <div className="font-semibold">On Leave</div>
                                                        <div className="text-sm opacity-90">Not available for appointments</div>
                                                    </div>
                                                </div>
                                                {formData.status === 'on_leave' && (
                                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                                    <Link
                                        href="/staff"
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Update Staff Member
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Staff Preview Card */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                    <h2 className="text-xl font-bold">Staff Preview</h2>
                                    <p className="text-blue-100 mt-1">Live preview of changes</p>
                                </div>

                                <div className="p-6">
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${getServiceColor(formData.service_type)} rounded-2xl text-white text-2xl font-bold mb-4`}>
                                            {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{formData.name || 'Staff Name'}</h3>
                                        {formData.service_type && (
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                {getServiceIcon(formData.service_type)}
                                                <span className="text-gray-600">{formData.service_type}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Preview */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${formData.status === 'available'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                    {formData.status === 'available' ? 'Available' : 'On Leave'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Daily Capacity</span>
                                                <span className="font-semibold">{formData.daily_capacity} appointments</span>
                                            </div>
                                        </div>

                                        {/* Capacity Visualization */}
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Capacity Visualization</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Slots Available</span>
                                                    <span className="font-semibold">{formData.daily_capacity}</span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${getServiceColor(formData.service_type)} rounded-full transition-all duration-500`}
                                                        style={{ width: '30%' }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 text-center">
                                                    {formData.daily_capacity} total slots per day
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}