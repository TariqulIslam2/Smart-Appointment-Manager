'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Layers, Clock, Users, ArrowLeft,
    Save, Shield, Briefcase, MessageSquare,
    AlertCircle, CheckCircle, Zap, Activity,
    Trash2
} from 'lucide-react';

export default function EditServicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [staffTypes, setStaffTypes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        duration: 30,
        required_staff_type: ''
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated' && serviceId) {
            Promise.all([fetchServiceData(), fetchStaffTypes()]);
        }
    }, [status, serviceId, router]);

    const fetchServiceData = async () => {
        try {
            const response = await fetch(`/api/services/${serviceId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name,
                    duration: data.duration,
                    required_staff_type: data.required_staff_type
                });
            } else {
                setError('Failed to load service data');
            }
        } catch (error) {
            console.error('Error fetching service:', error);
            setError('Error loading service data');
        } finally {
            setLoading(false);
        }
    };

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
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        // Validate form
        if (!formData.name.trim()) {
            setError('Service name is required');
            setSaving(false);
            return;
        }

        if (!formData.duration) {
            setError('Duration is required');
            setSaving(false);
            return;
        }

        if (!formData.required_staff_type) {
            setError('Required staff type is required');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Service updated successfully!');
                setTimeout(() => {
                    router.push('/services');
                    router.refresh();
                }, 1500);
            } else {
                setError(data.error || 'Failed to update service');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/services');
                router.refresh();
            } else {
                setError(data.error || 'Failed to delete service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            setError('Error deleting service');
        } finally {
            setDeleting(false);
        }
    };

    const getStaffTypeIcon = (type) => {
        const icons = {
            'Doctor': <Shield className="w-5 h-5" />,
            'Consultant': <Briefcase className="w-5 h-5" />,
            'Support Agent': <MessageSquare className="w-5 h-5" />,
        };
        return icons[type] || <Users className="w-5 h-5" />;
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block mb-6">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <Layers className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading service information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group transition-all mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Services</span>
                    </Link>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <Layers className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
                                <p className="text-gray-600 mt-1">Update service details and requirements</p>
                            </div>
                        </div>


                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
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

                                {/* Service Name */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Layers className="text-blue-500" size={18} />
                                        Service Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Medical Consultation"
                                    />
                                </div>

                                {/* Duration */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Clock className="text-purple-500" size={18} />
                                        Duration
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[15, 30, 45, 60, 90, 120].map((duration) => (
                                            <button
                                                key={duration}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, duration })}
                                                className={`p-4 rounded-xl border-2 transition-all ${formData.duration === duration
                                                    ? 'border-transparent bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-lg font-bold">{duration}</div>
                                                    <div className="text-sm">minutes</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Required Staff Type */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Users className="text-emerald-500" size={18} />
                                        Required Staff Type
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    {staffTypes.length === 0 ? (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                            <p className="text-yellow-700 text-sm">
                                                No staff types available. Please create staff members first.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {staffTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, required_staff_type: type })}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${formData.required_staff_type === type
                                                        ? 'border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {getStaffTypeIcon(type)}
                                                        <span className="font-medium">{type}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <Link
                                        href="/services"
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={saving || staffTypes.length === 0}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Update Service
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                    <h2 className="text-xl font-bold">Service Preview</h2>
                                    <p className="text-blue-100 mt-1">Live preview of changes</p>
                                </div>

                                <div className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white mb-4">
                                            <Layers className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{formData.name || 'Service Name'}</h3>
                                        {formData.required_staff_type && (
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                {getStaffTypeIcon(formData.required_staff_type)}
                                                <span className="text-gray-600">{formData.required_staff_type}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Duration</span>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                                    {formData.duration} minutes
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Staff Required</span>
                                                <span className="font-semibold">{formData.required_staff_type || 'None selected'}</span>
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