'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
    ListChecks,
    Users,
    Clock,
    UserCheck,
    Calendar,
    Scissors,
    ArrowRight,
    AlertCircle, Briefcase
} from 'lucide-react';

export default function QueuePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [queue, setQueue] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    const fetchData = async () => {
        try {
            const [queueRes, staffRes] = await Promise.all([
                fetch('/api/queue'),
                fetch('/api/staff?available=true')
            ]);

            if (queueRes.ok) {
                const queueData = await queueRes.json();
                setQueue(queueData);
            }

            if (staffRes.ok) {
                const staffData = await staffRes.json();
                setStaff(staffData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (appointmentId, staffId) => {
        if (!staffId) return;

        setAssigning(appointmentId);

        try {
            const response = await fetch('/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    staff_id: staffId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Appointment assigned successfully!');
                fetchData(); // Refresh data
            } else {
                alert(data.error || 'Failed to assign appointment');
            }
        } catch (error) {
            console.error('Error assigning appointment:', error);
            alert('Error assigning appointment');
        } finally {
            setAssigning(null);
        }
    };

    const handleAutoAssign = async (staffId) => {
        if (!staffId) return;

        try {
            const response = await fetch('/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: staffId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Appointment auto-assigned successfully!');
                fetchData();
            } else {
                alert(data.error || 'Failed to auto-assign');
            }
        } catch (error) {
            console.error('Error auto-assigning:', error);
            alert('Error auto-assigning');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-700 font-medium">Loading queue...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <ListChecks className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Waiting Queue
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {queue.length} appointment(s) waiting • {staff.length} staff available
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md">
                        <UserCheck className="text-green-500" size={20} />
                        <span className="font-medium">Real-time Management</span>
                    </div>
                </div>

                {queue.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50 rounded-full mb-6">
                            <ListChecks className="text-green-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Queue is Empty</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            All appointments are currently assigned to staff. New appointments will appear here when they need assignment.
                        </p>
                        <button
                            onClick={fetchData}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                        >
                            Refresh Queue
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Queue List */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Clock className="text-blue-500" size={20} />
                                        Queue Positions
                                    </h2>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                        {queue.length} in queue
                                    </span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {queue.map((item) => {
                                    const eligibleStaff = staff.filter(
                                        s => s.service_type === item.required_staff_type &&
                                            s.status === 'available' &&
                                            (s.appointment_count || 0) < s.daily_capacity
                                    );

                                    return (
                                        <div key={item.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-150">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-md">
                                                            #{item.position}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-lg font-bold text-gray-900">{item.customer_name}</h3>
                                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                                                Priority {item.position}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Scissors size={14} />
                                                                <span className="font-medium">{item.service_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                <span>{format(parseISO(item.appointment_date), 'MMM dd, yyyy')}</span>
                                                                <span>• {item.appointment_time}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                                <span className="flex items-center gap-1">
                                                                    <Users size={10} />
                                                                    Requires: {item.required_staff_type}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="relative min-w-[240px]">
                                                        <select
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                                            onChange={(e) => handleAssign(item.appointment_id, e.target.value)}
                                                            disabled={assigning === item.appointment_id || eligibleStaff.length === 0}
                                                            defaultValue=""
                                                        >
                                                            <option value="">Assign to staff...</option>
                                                            {eligibleStaff.length === 0 ? (
                                                                <option disabled>No available staff</option>
                                                            ) : (
                                                                eligibleStaff.map((s) => (
                                                                    <option key={s.id} value={s.id}>
                                                                        {s.name} ({s.appointment_count || 0}/{s.daily_capacity})
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {assigning === item.appointment_id ? (
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                                                    ) : (
                                                        <ArrowRight className="text-gray-400" size={20} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Staff */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Users className="text-green-500" size={20} />
                                        Available Staff
                                    </h2>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                        {staff.length} available
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {staff.map((s) => {
                                        const eligibleQueueItems = queue.filter(
                                            q => q.required_staff_type === s.service_type
                                        );
                                        const isAtCapacity = (s.appointment_count || 0) >= s.daily_capacity;
                                        const hasEligibleItems = eligibleQueueItems.length > 0;
                                        const capacityPercentage = ((s.appointment_count || 0) / s.daily_capacity) * 100;

                                        return (
                                            <div key={s.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-lg text-gray-900">{s.name}</h3>
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Briefcase size={14} className="text-purple-500" />
                                                            {s.service_type}
                                                        </p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isAtCapacity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {s.appointment_count || 0} / {s.daily_capacity}
                                                    </div>
                                                </div>

                                                {/* Capacity Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>Daily Capacity</span>
                                                        <span>{capacityPercentage.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isAtCapacity ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
                                                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm mb-4">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <ListChecks size={14} />
                                                        <span className="font-medium">{eligibleQueueItems.length}</span>
                                                        <span>eligible in queue</span>
                                                    </div>
                                                    {isAtCapacity && (
                                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                                            <AlertCircle size={12} />
                                                            At Full Capacity
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleAutoAssign(s.id)}
                                                    disabled={isAtCapacity || !hasEligibleItems}
                                                    className={`w-full py-3 rounded-xl font-semibold transition-all ${isAtCapacity || !hasEligibleItems
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-xl hover:scale-105'
                                                        }`}
                                                >
                                                    {isAtCapacity ? 'At Capacity' :
                                                        !hasEligibleItems ? 'No Eligible Items' :
                                                            'Auto-Assign Next'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}