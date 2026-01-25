'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, Users, Plus, Eye, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalAppointments: 0,
        completed: 0,
        pending: 0,
        queueCount: 0
    });
    const [staffLoad, setStaffLoad] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status, router]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard');

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setStats(data.stats);
                setStaffLoad(data.staffLoad);
                setActivityLog(data.activityLog);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
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
                    <p className="mt-6 text-gray-700 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Today's Appointments",
            value: stats.totalAppointments,
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            iconBg: "bg-blue-100"
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            iconBg: "bg-green-100"
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-50",
            iconBg: "bg-yellow-100"
        },
        {
            title: "Waiting Queue",
            value: stats.queueCount,
            icon: Users,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            iconBg: "bg-red-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-full mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name || 'User'}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/appointments/create"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium">
                            <Plus size={20} />
                            New Appointment
                        </Link>
                        <Link href="/queue"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium border border-gray-200">
                            <Eye size={20} />
                            View Queue
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`text-${stat.color.split('-')[1]}-600`} size={24} />
                                        </div>
                                        <TrendingUp className="text-gray-400" size={20} />
                                    </div>
                                    <h3 className="text-gray-600 font-medium text-sm mb-1">{stat.title}</h3>
                                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Staff Load */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="text-purple-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Staff Load Summary</h2>
                        </div>
                        <div className="space-y-4">
                            {staffLoad.map(staff => {
                                const percentage = (staff.loadcount / staff.capacity) * 100;
                                const isOverloaded = staff.loadcount >= staff.capacity;

                                return (
                                    <div key={staff.id} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-700">{staff.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${isOverloaded
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                    }`}>
                                                    {staff.loadcount} / {staff.capacity}
                                                </span>
                                                <span className={`text-sm font-medium ${isOverloaded ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {isOverloaded ? 'Fully Booked' : 'Available'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isOverloaded
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                                                    }`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="text-blue-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {activityLog.length > 0 ? (
                                activityLog.map(log => (
                                    <div key={log.id}
                                        className="p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg hover:from-blue-100 transition-colors duration-200">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                                            <Clock size={12} />
                                            {new Date(log.created_at).toLocaleDateString()} •
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-gray-700 font-medium">{log.action}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Activity className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-400">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #2563eb, #7c3aed);
                }
            `}</style>
        </div>
    );
}