import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's stats
    const [todayStats] = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(status = 'completed') as completed,
        SUM(status = 'scheduled') as pending
      FROM appointments 
      WHERE appointment_date = ?
    `, [today]);
  
    // Get queue count
    const [queueResult] = await query('SELECT COUNT(*) as count FROM queue');
    // console.log("queueResult", queueResult)
    // Get staff load
    const staffLoad = await query(`
      SELECT s.id, s.name, s.daily_capacity as capacity, 
        COUNT(a.id) as loadcount
      FROM staff s
      LEFT JOIN appointments a ON s.id = a.staff_id 
        AND a.appointment_date = ? 
        AND a.status IN ('scheduled', 'completed')
      GROUP BY s.id, s.name, s.daily_capacity
    `, [today]);

    // Get activity log
    const activityLog = await query(`
      SELECT * FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    return NextResponse.json({
      stats: {
        totalAppointments: todayStats.total || 0,
        completed: todayStats.completed || 0,
        pending: todayStats.pending || 0,
        queueCount: queueResult.count || 0
      },
      staffLoad: staffLoad || [],
      activityLog: activityLog || []
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}