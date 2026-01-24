'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react';

export default function StaffPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
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
            fetchStaff();
        }
    }, [status, router]);

    useEffect(() => {
        const filtered = staff.filter(member =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.service_type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStaff(filtered);
        setCurrentPage(1);
    }, [searchQuery, staff]);

    const fetchStaff = async () => {
        try {
            const response = await fetch('/api/staff');
            if (response.ok) {
                const data = await response.json();
                setStaff(data);
                setFilteredStaff(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }

        setDeleteLoading(id);

        try {
            const response = await fetch(`/api/staff/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchStaff();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete staff');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Error deleting staff');
        } finally {
            setDeleteLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            available: {
                text: 'Available',
                className: 'bg-green-500 text-white',
            },
            on_leave: {
                text: 'On Leave',
                className: 'bg-red-500 text-white',
            },
        };

        const badge = statusMap[status] || {
            text: 'Unknown',
            className: 'bg-gray-400 text-white',
        };

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${badge.className}`}
            >
                {badge.text}
            </span>
        );
    };


    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

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
                    <p className="mt-6 text-gray-700 font-medium">Loading staff...</p>
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
                            <Users className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Staff Management
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">{filteredStaff.length} team members</p>
                        </div>
                    </div>
                    <Link
                        href="/staff/create"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        <Plus size={20} />
                        Add New Staff
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
                            placeholder="Search by name or service type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200 ">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Service Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Daily Capacity
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
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Users className="mx-auto text-gray-300 mb-3" size={48} />
                                            <p className="text-gray-500 font-medium">
                                                {searchQuery ? 'No staff found matching your search' : 'No staff members found'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((member, index) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {/* <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div> */}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{member.service_type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <span className="font-semibold">{member.daily_capacity}</span> appointments/day
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* <div>
                                                    <span className="font-semibold text-gray-900 mr-2 capitalize bg-sky-500 px-2 py-1 rounded-full">{member.status}</span>
                                                </div> */}
                                                {getStatusBadge(member.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/staff/${member.id}`}
                                                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(member.id, member.name)}
                                                        disabled={deleteLoading === member.id}
                                                        className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
                                                    >
                                                        <Trash2 size={16} />
                                                        {deleteLoading === member.id ? 'Deleting...' : 'Delete'}
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
                                    <span className="font-semibold">{Math.min(indexOfLastItem, filteredStaff.length)}</span> of{' '}
                                    <span className="font-semibold">{filteredStaff.length}</span> results
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