import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all appointments with filters
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const staff_id = searchParams.get('staff_id');
        const status = searchParams.get('status');

        let sql = `
      SELECT a.*, s.name as service_name, st.name as staff_name, 
             se.duration, se.required_staff_type
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN services se ON a.service_id = se.id
      WHERE 1=1
    `;
        const params = [];

        if (date) {
            sql += ' AND a.appointment_date = ?';
            params.push(date);
        }

        if (staff_id) {
            sql += ' AND a.staff_id = ?';
            params.push(staff_id);
        }

        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';

        const appointments = await query(sql, params);
        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Appointments GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create new appointment
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { customer_name, service_id, staff_id, appointment_date, appointment_time } = data;

        // Validate required fields
        if (!customer_name || !service_id || !appointment_date || !appointment_time) {
            return NextResponse.json(
                { error: 'All fields except staff are required' },
                { status: 400 }
            );
        }

        // Check if staff is provided
        let appointmentStatus = 'scheduled';
        let finalStaffId = staff_id;
        let position = null;

        if (!staff_id) {
            // If no staff, put in queue
            appointmentStatus = 'queued';
            finalStaffId = null;
        } else {
            // Check staff capacity
            const [capacityCheck] = await query(
                `SELECT COUNT(*) as count FROM appointments 
         WHERE staff_id = ? AND appointment_date = ? 
         AND status IN ('scheduled', 'completed')`,
                [staff_id, appointment_date]
            );

            const [staffInfo] = await query(
                'SELECT daily_capacity FROM staff WHERE id = ?',
                [staff_id]
            );

            if (capacityCheck.count >= staffInfo.daily_capacity) {
                return NextResponse.json(
                    { error: 'Staff has reached daily capacity' },
                    { status: 400 }
                );
            }

            // Check time conflict
            const [conflictCheck] = await query(
                `SELECT id FROM appointments 
         WHERE staff_id = ? AND appointment_date = ? 
         AND appointment_time = ? AND status != 'cancelled'`,
                [staff_id, appointment_date, appointment_time]
            );

            if (conflictCheck) {
                return NextResponse.json(
                    { error: 'Time conflict with existing appointment' },
                    { status: 400 }
                );
            }
        }

        // Create appointment
        const result = await query(
            `INSERT INTO appointments 
       (customer_name, service_id, staff_id, appointment_date, appointment_time, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [customer_name, service_id, finalStaffId, appointment_date, appointment_time, appointmentStatus]
        );

        const appointmentId = result.insertId;

        // If no staff, add to queue
        if (!staff_id) {
            // Get current max position
            const [maxPos] = await query('SELECT MAX(position) as max FROM queue');
            position = (maxPos.max || 0) + 1;

            await query(
                'INSERT INTO queue (appointment_id, position) VALUES (?, ?)',
                [appointmentId, position]
            );

            // Log activity
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${customer_name}" added to queue at position ${position}`]
            );
        } else {
            // Log activity
            const [staff] = await query('SELECT name FROM staff WHERE id = ?', [staff_id]);
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${customer_name}" scheduled with ${staff.name}`]
            );
        }

        return NextResponse.json({
            success: true,
            id: appointmentId,
            message: staff_id ? 'Appointment created successfully' : 'Appointment added to queue',
            queue_position: position
        });
    } catch (error) {
        console.error('Appointments POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}