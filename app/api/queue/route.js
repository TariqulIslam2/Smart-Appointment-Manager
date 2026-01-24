import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all queued appointments
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const queue = await query(`
      SELECT q.*, a.customer_name, a.appointment_date, a.appointment_time,
             s.name as service_name, s.required_staff_type
      FROM queue q
      JOIN appointments a ON q.appointment_id = a.id
      JOIN services s ON a.service_id = s.id
      ORDER BY q.position ASC
    `);

        return NextResponse.json(queue);
    } catch (error) {
        console.error('Queue GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST assign from queue
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { staff_id, appointment_id } = data;

        // If appointment_id is provided, assign specific appointment
        if (appointment_id) {
            // Get appointment details
            const [appointment] = await query(
                `SELECT a.*, s.required_staff_type 
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         WHERE a.id = ? AND a.staff_id IS NULL`,
                [appointment_id]
            );

            if (!appointment) {
                return NextResponse.json(
                    { error: 'Appointment not found or already assigned' },
                    { status: 404 }
                );
            }

            // Check staff eligibility
            const [staff] = await query(
                'SELECT * FROM staff WHERE id = ? AND service_type = ?',
                [staff_id, appointment.required_staff_type]
            );

            if (!staff) {
                return NextResponse.json(
                    { error: 'Staff is not eligible for this service' },
                    { status: 400 }
                );
            }

            // Check capacity
            const [capacityCheck] = await query(
                `SELECT COUNT(*) as count FROM appointments 
         WHERE staff_id = ? AND appointment_date = ? 
         AND status IN ('scheduled', 'completed')`,
                [staff_id, appointment.appointment_date]
            );

            if (capacityCheck.count >= staff.daily_capacity) {
                return NextResponse.json(
                    { error: 'Staff has reached daily capacity' },
                    { status: 400 }
                );
            }

            // Update appointment
            await query(
                'UPDATE appointments SET staff_id = ?, status = "scheduled" WHERE id = ?',
                [staff_id, appointment_id]
            );

            // Remove from queue
            await query('DELETE FROM queue WHERE appointment_id = ?', [appointment_id]);

            // Log activity
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${appointment.customer_name}" assigned from queue to ${staff.name}`]
            );

            return NextResponse.json({
                success: true,
                message: 'Appointment assigned successfully'
            });
        }

        // If no appointment_id, find earliest eligible appointment
        if (!appointment_id && staff_id) {
            // Get staff info
            const [staff] = await query('SELECT * FROM staff WHERE id = ?', [staff_id]);

            // Find earliest queued appointment that matches staff type
            const [eligibleAppointment] = await query(`
        SELECT q.appointment_id, a.customer_name, a.appointment_date, s.required_staff_type
        FROM queue q
        JOIN appointments a ON q.appointment_id = a.id
        JOIN services s ON a.service_id = s.id
        WHERE s.required_staff_type = ?
        ORDER BY q.position ASC
        LIMIT 1
      `, [staff.service_type]);

            if (!eligibleAppointment) {
                return NextResponse.json(
                    { error: 'No eligible appointments in queue for this staff type' },
                    { status: 400 }
                );
            }

            // Check capacity
            const [capacityCheck] = await query(
                `SELECT COUNT(*) as count FROM appointments 
         WHERE staff_id = ? AND appointment_date = ? 
         AND status IN ('scheduled', 'completed')`,
                [staff_id, eligibleAppointment.appointment_date]
            );

            if (capacityCheck.count >= staff.daily_capacity) {
                return NextResponse.json(
                    { error: 'Staff has reached daily capacity' },
                    { status: 400 }
                );
            }

            // Update appointment
            await query(
                'UPDATE appointments SET staff_id = ?, status = "scheduled" WHERE id = ?',
                [staff_id, eligibleAppointment.appointment_id]
            );

            // Remove from queue
            await query('DELETE FROM queue WHERE appointment_id = ?', [eligibleAppointment.appointment_id]);

            // Log activity
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${eligibleAppointment.customer_name}" auto-assigned to ${staff.name}`]
            );

            return NextResponse.json({
                success: true,
                message: 'Appointment auto-assigned successfully',
                appointment_id: eligibleAppointment.appointment_id
            });
        }

        return NextResponse.json(
            { error: 'Either staff_id or appointment_id is required' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Queue POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}