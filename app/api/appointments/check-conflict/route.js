import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const staff_id = searchParams.get('staff_id');
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const exclude_id = searchParams.get('exclude_id'); // For updates

        let sql = `
      SELECT a.*, s.name as service_name 
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE staff_id = ? 
        AND appointment_date = ? 
        AND appointment_time = ?
        AND status != 'cancelled'
    `;
        const params = [staff_id, date, time];

        if (exclude_id) {
            sql += ' AND a.id != ?';
            params.push(exclude_id);
        }

        const conflicts = await query(sql, params);

        return NextResponse.json({
            conflict: conflicts.length > 0,
            existingAppointment: conflicts[0] || null
        });
    } catch (error) {
        console.error('Conflict check error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}