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
        const service_id = searchParams.get('service_id');
        const exclude_id = searchParams.get('exclude_id');

        // 🔹 Get new service duration
        const [service] = await query(
            'SELECT duration FROM services WHERE id = ?',
            [service_id]
        );

        if (!service) {
            return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
        }

        let sql = `
            SELECT 
                a.*, 
                s.name AS service_name,
                s.duration,
                ADDTIME(a.appointment_time, SEC_TO_TIME(s.duration * 60)) AS end_time
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.staff_id = ?
              AND a.appointment_date = ?
              AND a.status != 'cancelled'
              AND (
                  ? < ADDTIME(a.appointment_time, SEC_TO_TIME(s.duration * 60))
                  AND
                  ADDTIME(?, SEC_TO_TIME(? * 60)) > a.appointment_time
              )
        `;

        const params = [
            staff_id,
            date,
            time,
            time,
            service.duration
        ];

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
