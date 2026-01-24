import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET single staff
export async function GET(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const staff = await query('SELECT * FROM staff WHERE id = ?', [id]);

        if (staff.length === 0) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        return NextResponse.json(staff[0]);
    } catch (error) {
        console.error('Staff GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update staff
export async function PUT(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await request.json();
        const { name, service_type, daily_capacity, status } = data;
        // console.log(name, service_type, daily_capacity, status);
        // Get current staff for logging
        const [currentStaff] = await query('SELECT name FROM staff WHERE id = ?', [id]);

        await query(
            'UPDATE staff SET name = ?, service_type = ?, daily_capacity = ?, status = ? WHERE id = ?',
            [name, service_type, daily_capacity, status, id]
        );

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Staff "${currentStaff.name}" updated by ${session.user.email}`]
        );

        return NextResponse.json({ success: true, message: 'Staff updated successfully' });
    } catch (error) {
        console.error('Staff PUT error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE staff
export async function DELETE(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // ✅ Await params (IMPORTANT)
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { error: 'Invalid staff id' },
                { status: 400 }
            );
        }

        // Get staff
        const rows = await query(
            'SELECT name FROM staff WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Staff not found' },
                { status: 404 }
            );
        }

        const staff = rows[0];

        // Delete staff
        await query('DELETE FROM staff WHERE id = ?', [id]);

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Staff "${staff.name}" deleted by ${session.user.email}`]
        );

        return NextResponse.json({
            success: true,
            message: 'Staff deleted successfully',
        });
    } catch (error) {
        console.error('Staff DELETE error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}