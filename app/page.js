'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
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
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/appointments/create" className="btn-primary">
            + New Appointment
          </Link>
          <Link href="/queue" className="btn-secondary">
            View Queue
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600">Today's Appointments</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalAppointments}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600">Waiting Queue</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{stats.queueCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Load */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Staff Load Summary</h2>
          <div className="space-y-3">
            {staffLoad.map(staff => (
              <div key={staff.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{staff.name}</span>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${staff.load >= staff.capacity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {staff.load} / {staff.capacity}
                  </span>
                  <span className="text-sm">
                    {staff.load >= staff.capacity ? '(Booked)' : '(OK)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activityLog.length > 0 ? (
              activityLog.map(log => (
                <div key={log.id} className="p-3 border-l-4 border-blue-500 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleDateString()} •
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>{log.action}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/appointments" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-blue-600 text-2xl mb-2">📅</div>
            <h3 className="font-bold">Manage Appointments</h3>
            <p className="text-sm text-gray-600">View and manage all appointments</p>
          </Link>

          <Link href="/staff" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="text-green-600 text-2xl mb-2">👥</div>
            <h3 className="font-bold">Staff Management</h3>
            <p className="text-sm text-gray-600">Manage staff and availability</p>
          </Link>

          <Link href="/queue" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-purple-600 text-2xl mb-2">⏳</div>
            <h3 className="font-bold">Waiting Queue</h3>
            <p className="text-sm text-gray-600">Manage queued appointments</p>
          </Link>
        </div>
      </div>
    </div>
  );
}