'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
    Calendar,
    Save,
    User,
    Scissors,
    Clock,
    CalendarDays,
    Users,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Briefcase,
    ChevronDown,
    XCircle,
    Edit
} from 'lucide-react';

export default function EditAppointmentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id;

    const [appointment, setAppointment] = useState(null);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [conflict, setConflict] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        service_id: '',
        staff_id: '',
        appointment_date: '',
        appointment_time: '',
        status: 'scheduled'
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated' && appointmentId) {
            fetchAppointmentData();
        }
    }, [status, router, appointmentId]);

    useEffect(() => {
        if (formData.service_id && formData.appointment_date) {
            fetchEligibleStaff();
        }
    }, [formData.service_id, formData.appointment_date]);

    const fetchAppointmentData = async () => {
        try {
            const [appointmentRes, servicesRes] = await Promise.all([
                fetch(`/api/appointments/${appointmentId}`),
                fetch('/api/services')
            ]);

            if (appointmentRes.ok) {
                const data = await appointmentRes.json();
                setAppointment(data);
                setFormData({
                    customer_name: data.customer_name,
                    service_id: data.service_id,
                    staff_id: data.staff_id || '',
                    appointment_date: format(parseISO(data.appointment_date), 'yyyy-MM-dd'),
                    appointment_time: data.appointment_time,
                    status: data.status
                });
            }

            if (servicesRes.ok) {
                const data = await servicesRes.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEligibleStaff = async () => {
        if (!formData.service_id) return;

        try {
            const service = services.find(s => s.id == formData.service_id);
            if (!service) return;

            const response = await fetch(
                `/api/staff?type=${service.required_staff_type}&date=${formData.appointment_date}`
            );

            if (response.ok) {
                const data = await response.json();
                setStaff(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const checkConflict = async (staffId, date, time) => {
        if (!staffId || appointmentId === staffId) return;

        try {
            const response = await fetch(
                `/api/appointments/check-conflict?staff_id=${staffId}&date=${date}&time=${time}&service_id=${formData.service_id}&exclude_id=${appointmentId}`
            );

            if (response.ok) {
                const data = await response.json();
                setConflict(data.conflict ? data.existingAppointment : null);
            }
        } catch (error) {
            console.error('Error checking conflict:', error);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (conflict) {
            alert('Please resolve the conflict before submitting');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Appointment updated successfully!');
                router.push('/appointments');
                router.refresh();
            } else {
                alert(data.error || 'Failed to update appointment');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Error updating appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeChange = (e) => {
        setFormData({ ...formData, appointment_time: e.target.value });
        if (formData.staff_id) {
            checkConflict(formData.staff_id, formData.appointment_date, e.target.value);
        }
    };

    const handleStaffChange = (e) => {
        const staffId = e.target.value;
        setFormData({ ...formData, staff_id: staffId });

        if (staffId) {
            checkConflict(staffId, formData.appointment_date, formData.appointment_time);
        } else {
            setConflict(null);
        }
    };

    const selectedService = services.find(s => s.id == formData.service_id);
    const selectedStaff = staff.find(s => s.id == formData.staff_id);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-700 font-medium">Loading appointment...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Appointment Not Found</h3>
                    <p className="text-gray-600 mb-8">The appointment you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/appointments')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
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
                        <span className="font-medium">Back to Appointments</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Edit className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Edit Appointment
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Update appointment details</p>
                        </div>
                    </div>
                </div>

                {/* Appointment Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-semibold text-gray-500 mb-1">Appointment ID</div>
                            <div className="font-mono text-gray-900">{appointment.id}</div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500 mb-1">Created Date</div>
                            <div className="text-gray-900">
                                {format(parseISO(appointment.created_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500 mb-1">Original Date</div>
                            <div className="text-gray-900">
                                {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500 mb-1">Current Status</div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {appointment.status.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Customer Name */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <User className="text-blue-500" size={18} />
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Service Selection */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <Scissors className="text-purple-500" size={18} />
                                    Service
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value, staff_id: '' })}
                                        required
                                    >
                                        <option value="">Select a service</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} ({service.duration} mins)
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="text-gray-400" size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <CalendarDays className="text-indigo-500" size={18} />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Clock className="text-blue-500" size={18} />
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                        value={formData.appointment_time}
                                        onChange={handleTimeChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    Status
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { value: 'scheduled', label: 'Scheduled', color: 'blue' },
                                        { value: 'completed', label: 'Completed', color: 'green' },
                                        { value: 'cancelled', label: 'Cancelled', color: 'red' },
                                        { value: 'no_show', label: 'No Show', color: 'yellow' },
                                    ].map((statusOption) => (
                                        <label key={statusOption.value} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                className="peer sr-only"
                                                name="status"
                                                value={statusOption.value}
                                                checked={formData.status === statusOption.value}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            />
                                            <div className={`p-3 border-2 rounded-xl text-center transition-all ${formData.status === statusOption.value
                                                ? `border-${statusOption.color}-500 bg-${statusOption.color}-50`
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}>
                                                <span className={`font-medium ${formData.status === statusOption.value
                                                    ? `text-${statusOption.color}-600`
                                                    : 'text-gray-700'
                                                    }`}>
                                                    {statusOption.label}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Staff Assignment */}
                            {selectedService && (
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Users className="text-green-500" size={18} />
                                        Assign Staff
                                    </label>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                                                value={formData.staff_id}
                                                onChange={handleStaffChange}
                                            >
                                                <option value="">No staff (keep in queue)</option>
                                                {staff.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} ({s.appointment_count || 0}/{s.daily_capacity} appointments)
                                                        {s.status === 'on_leave' ? ' [On Leave]' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="text-gray-400" size={20} />
                                            </div>
                                        </div>

                                        {selectedStaff && (
                                            <div className={`p-4 border-2 rounded-xl transition-all ${(selectedStaff.appointment_count || 0) >= selectedStaff.daily_capacity
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-blue-300 bg-blue-50'
                                                }`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg">
                                                            <Briefcase className="text-blue-600" size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{selectedStaff.name}</h4>
                                                            <p className="text-sm text-gray-600">{selectedService.required_staff_type}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${(selectedStaff.appointment_count || 0) >= selectedStaff.daily_capacity
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {(selectedStaff.appointment_count || 0)} / {selectedStaff.daily_capacity}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {selectedStaff.status === 'on_leave' && (
                                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                                            <AlertCircle size={16} />
                                                            <span>This staff member is currently on leave</span>
                                                        </div>
                                                    )}
                                                    {(selectedStaff.appointment_count || 0) >= selectedStaff.daily_capacity && (
                                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                                            <AlertCircle size={16} />
                                                            <span>{selectedStaff.name} has reached daily capacity</span>
                                                        </div>
                                                    )}
                                                    {(selectedStaff.appointment_count || 0) < selectedStaff.daily_capacity && (
                                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                                            <CheckCircle size={16} />
                                                            <span>Available for appointment</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!formData.staff_id && (
                                            <div className="p-4 border-2 border-yellow-300 bg-yellow-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                                        <Clock className="text-yellow-600" size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-yellow-800">Will remain in Queue</h4>
                                                        <p className="text-sm text-yellow-700 mt-1">
                                                            This appointment will remain in the waiting queue for manual assignment.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Conflict Alert */}
                            {conflict && (
                                <div className="group">
                                    <div className="p-4 border-2 border-red-300 bg-red-50 rounded-xl animate-shake">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                                <XCircle className="text-red-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-red-800 mb-2">Time Conflict Detected!</h4>
                                                <p className="text-red-700 mb-3">
                                                    {selectedStaff?.name} already has an appointment at this time:
                                                </p>
                                                <div className="p-3 bg-white border border-red-200 rounded-lg mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{conflict.customer_name}</div>
                                                            <div className="text-sm text-gray-600">{conflict.service_name}</div>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {conflict.appointment_time}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, staff_id: '' })}
                                                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                                                    >
                                                        Pick Another Staff
                                                    </button>
                                                    <button
                                                        type="button"
                                                        // onClick={() => {
                                                        //     const newTime = prompt('Enter new time (HH:MM):', formData.appointment_time);
                                                        //     if (newTime) {
                                                        //         setFormData({ ...formData, appointment_time: newTime });
                                                        //         setConflict(null);
                                                        //     }
                                                        // }}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                                                    >
                                                        Change Time
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.push('/appointments')}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || (conflict !== null)}
                                    className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform ${submitting || conflict
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save size={20} />
                                            Update Appointment
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
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