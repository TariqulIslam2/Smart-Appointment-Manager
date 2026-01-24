'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Scissors,
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users
} from 'lucide-react';

export default function ServicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            fetchServices();
        }
    }, [status, router]);

    useEffect(() => {
        const filtered = services.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.required_staff_type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredServices(filtered);
        setCurrentPage(1);
    }, [searchQuery, services]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
                setFilteredServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        setDeleteLoading(id);

        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchServices();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Error deleting service');
        } finally {
            setDeleteLoading(null);
        }
    };

    const getDurationBadge = (duration) => {
        let colorClass = 'bg-blue-100 text-blue-800';

        if (duration > 120) colorClass = 'bg-purple-100 text-purple-800';
        else if (duration > 60) colorClass = 'bg-indigo-100 text-indigo-800';
        else if (duration > 30) colorClass = 'bg-blue-100 text-blue-800';
        else colorClass = 'bg-green-100 text-green-800';

        return (
            <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}
            >
                <Clock size={12} />
                {duration} min
            </span>
        );
    };

    const getStaffTypeBadge = (staffType) => {
        const typeMap = {
            stylist: {
                text: 'Stylist',
                className: 'bg-pink-100 text-pink-800',
            },
            barber: {
                text: 'Barber',
                className: 'bg-amber-100 text-amber-800',
            },
            therapist: {
                text: 'Therapist',
                className: 'bg-teal-100 text-teal-800',
            },
            technician: {
                text: 'Technician',
                className: 'bg-cyan-100 text-cyan-800',
            },
            specialist: {
                text: 'Specialist',
                className: 'bg-violet-100 text-violet-800',
            },
        };

        const badge = typeMap[staffType.toLowerCase()] || {
            text: staffType,
            className: 'bg-gray-100 text-gray-800',
        };

        return (
            <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.className}`}
            >
                <Users size={12} />
                {badge.text}
            </span>
        );
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-700 font-medium">Loading services...</p>
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
                            <Scissors className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Services Management
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">{filteredServices.length} services available</p>
                        </div>
                    </div>
                    <Link
                        href="/services/create"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <Plus size={20} />
                        Add New Service
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by service name or staff type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Service Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Required Staff Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <Scissors className="mx-auto text-gray-300 mb-3" size={48} />
                                            <p className="text-gray-500 font-medium">
                                                {searchQuery ? 'No services found matching your search' : 'No services found'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((service) => (
                                        <tr
                                            key={service.id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{service.name}</div>
                                                        {service.description && (
                                                            <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getDurationBadge(service.duration)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStaffTypeBadge(service.required_staff_type)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/services/${service.id}`}
                                                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(service.id, service.name)}
                                                        disabled={deleteLoading === service.id}
                                                        className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
                                                    >
                                                        <Trash2 size={16} />
                                                        {deleteLoading === service.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                                    <span className="font-semibold">{Math.min(indexOfLastItem, filteredServices.length)}</span> of{' '}
                                    <span className="font-semibold">{filteredServices.length}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => handlePageChange(index + 1)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === index + 1
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}