'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
    Calendar,
    Plus,
    Users,
    Scissors,
    Clock,
    Filter,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    CalendarDays,
    Briefcase,
    ChevronDown,
    RefreshCw
} from 'lucide-react';

export default function AppointmentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date: '',
        staff_id: '',
        status: ''
    });
    const [staffList, setStaffList] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            fetchAppointments();
            fetchStaff();
        }
    }, [status, router]);

    useEffect(() => {
        fetchAppointments();
    }, [filters]);

    const fetchAppointments = async () => {
        try {
            let url = '/api/appointments?';
            const params = new URLSearchParams();

            if (filters.date) params.append('date', filters.date);
            if (filters.staff_id) params.append('staff_id', filters.staff_id);
            if (filters.status) params.append('status', filters.status);

            const response = await fetch(url + params.toString());
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await fetch('/api/staff');
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            scheduled: {
                text: 'Scheduled',
                className: 'bg-blue-100 text-blue-800',
                icon: <Clock size={12} />
            },
            completed: {
                text: 'Completed',
                className: 'bg-green-100 text-green-800',
                icon: <CheckCircle size={12} />
            },
            cancelled: {
                text: 'Cancelled',
                className: 'bg-red-100 text-red-800',
                icon: <XCircle size={12} />
            },
            no_show: {
                text: 'No Show',
                className: 'bg-yellow-100 text-yellow-800',
                icon: <AlertCircle size={12} />
            },
            queued: {
                text: 'In Queue',
                className: 'bg-purple-100 text-purple-800',
                icon: <Users size={12} />
            }
        };

        const badge = statusMap[status] || {
            text: status,
            className: 'bg-gray-100 text-gray-800',
            icon: <Clock size={12} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.className}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const appointment = appointments.find(a => a.id === id);
            // console.log('handleStatusChange', id, newStatus, appointment);
            appointment.appointment_date = format(parseISO(appointment.appointment_date), 'yyyy-MM-dd');
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...appointment,
                    status: newStatus
                }),
            });

            if (response.ok) {
                fetchAppointments();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusOptions = () => {
        const statuses = [
            { value: 'scheduled', label: 'Scheduled', color: 'blue' },
            { value: 'completed', label: 'Completed', color: 'green' },
            { value: 'cancelled', label: 'Cancelled', color: 'red' },
            { value: 'no_show', label: 'No Show', color: 'yellow' },
            { value: 'queued', label: 'Queued', color: 'yellow' },
        ];

        return statuses.map(status => (
            <option key={status.value} value={status.value}>
                {status.label}
            </option>
        ));
    };

    const hasActiveFilters = () => {
        return filters.date || filters.staff_id || filters.status;
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-700 font-medium">Loading appointments...</p>
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
                            <Calendar className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Appointments
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {appointments.length} total appointment(s)
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/appointments/create"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <Plus size={20} />
                        New Appointment
                    </Link>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="text-blue-500" size={20} />
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                        </div>
                        {hasActiveFilters() && (
                            <button
                                onClick={() => setFilters({ date: '', staff_id: '', status: '' })}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={16} />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Filter */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <CalendarDays className="text-blue-500" size={16} />
                                Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            />
                        </div>

                        {/* Staff Filter */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Briefcase className="text-purple-500" size={16} />
                                Staff Member
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                    value={filters.staff_id}
                                    onChange={(e) => setFilters({ ...filters, staff_id: e.target.value })}
                                >
                                    <option value="">All Staff</option>
                                    {staffList.map((staff) => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="text-gray-400" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No Show</option>
                                    <option value="queued">In Queue</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="text-gray-400" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters() && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <Filter size={14} />
                                <span>Active filters:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.date && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                        <CalendarDays size={12} />
                                        Date: {format(new Date(filters.date), 'MMM dd, yyyy')}
                                        <button
                                            onClick={() => setFilters({ ...filters, date: '' })}
                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.staff_id && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                                        <Briefcase size={12} />
                                        Staff: {staffList.find(s => s.id === filters.staff_id)?.name || 'Selected'}
                                        <button
                                            onClick={() => setFilters({ ...filters, staff_id: '' })}
                                            className="ml-1 text-purple-500 hover:text-purple-700"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.status && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                                        {getStatusBadge(filters.status)}
                                        <button
                                            onClick={() => setFilters({ ...filters, status: '' })}
                                            className="ml-1 text-green-500 hover:text-green-700"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Service
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Staff
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                                            <p className="text-gray-500 font-medium">
                                                {hasActiveFilters() ? 'No appointments found matching your filters' : 'No appointments found'}
                                            </p>
                                            {hasActiveFilters() && (
                                                <button
                                                    onClick={() => setFilters({ date: '', staff_id: '', status: '' })}
                                                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    Clear filters to see all appointments
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((appointment) => (
                                        <tr
                                            key={appointment.id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {appointment.customer_name?.charAt(0).toUpperCase() || 'C'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{appointment.customer_name}</div>
                                                        <div className="text-xs text-gray-500">Customer</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <Scissors className="text-blue-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{appointment.service_name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {appointment.duration} minutes
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <Calendar className="text-purple-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {appointment.appointment_time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                                        <User className="text-indigo-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {appointment.staff_name || 'Unassigned'}
                                                        </div>
                                                        {!appointment.staff_name && (
                                                            <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                                <AlertCircle size={12} />
                                                                In Queue
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(appointment.status)}
                                                    {appointment.status === 'scheduled' && (
                                                        <div className="relative">
                                                            <select
                                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none"
                                                                value={appointment.status}
                                                                onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                                            >
                                                                {getStatusOptions()}
                                                            </select>
                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                <ChevronDown className="text-gray-400" size={12} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/appointments/${appointment.id}`}
                                                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                    {appointment.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                                            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <XCircle size={16} />
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}