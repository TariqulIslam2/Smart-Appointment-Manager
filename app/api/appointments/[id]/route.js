import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET single appointment
export async function GET(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const appointments = await query(
            `SELECT a.*, s.name as service_name, st.name as staff_name, 
              s.duration, s.required_staff_type
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN staff st ON a.staff_id = st.id
       WHERE a.id = ?`,
            [id]
        );

        if (appointments.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json(appointments[0]);
    } catch (error) {
        console.error('Appointment GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update appointment
export async function PUT(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await request.json();
        const { customer_name, service_id, staff_id, appointment_date, appointment_time, status } = data;

        // Get current appointment
        const [currentAppointment] = await query(
            'SELECT customer_name, staff_id, status FROM appointments WHERE id = ?',
            [id]
        );

        // Check if staff is being changed from null to assigned (queue assignment)
        const isQueueAssignment = !currentAppointment.staff_id && staff_id;

        // If staff is assigned, check capacity and conflict
        if (staff_id && !isQueueAssignment) {
            // Check staff capacity
            const [capacityCheck] = await query(
                `SELECT COUNT(*) as count FROM appointments 
         WHERE staff_id = ? AND appointment_date = ? 
         AND status IN ('scheduled', 'completed')
         AND id != ?`,
                [staff_id, appointment_date, id]
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
         AND appointment_time = ? AND status != 'cancelled'
         AND id != ?`,
                [staff_id, appointment_date, appointment_time, id]
            );

            if (conflictCheck) {
                return NextResponse.json(
                    { error: 'Time conflict with existing appointment' },
                    { status: 400 }
                );
            }
        }

        // Update appointment
        await query(
            `UPDATE appointments 
       SET customer_name = ?, service_id = ?, staff_id = ?, 
           appointment_date = ?, appointment_time = ?, status = ?
       WHERE id = ?`,
            [customer_name, service_id, staff_id, appointment_date, appointment_time, status, id]
        );

        // If moving from queue to assigned staff, remove from queue
        if (isQueueAssignment) {
            await query('DELETE FROM queue WHERE appointment_id = ?', [id]);

            const [staff] = await query('SELECT name FROM staff WHERE id = ?', [staff_id]);
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${customer_name}" assigned from queue to ${staff.name}`]
            );
        } else {
            // Log general update
            await query(
                'INSERT INTO activity_log (action) VALUES (?)',
                [`Appointment for "${customer_name}" updated by ${session.user.email}`]
            );
        }

        return NextResponse.json({ success: true, message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Appointment PUT error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE appointment
export async function DELETE(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        // Get appointment details for logging
        const [appointment] = await query(
            'SELECT customer_name FROM appointments WHERE id = ?',
            [id]
        );

        // Remove from queue if exists
        await query('DELETE FROM queue WHERE appointment_id = ?', [id]);

        // Delete appointment
        await query('DELETE FROM appointments WHERE id = ?', [id]);

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Appointment for "${appointment.customer_name}" deleted by ${session.user.email}`]
        );

        return NextResponse.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Appointment DELETE error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}