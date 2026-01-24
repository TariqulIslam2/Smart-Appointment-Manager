import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET single service
export async function GET(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const services = await query('SELECT * FROM services WHERE id = ?', [id]);

        if (services.length === 0) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json(services[0]);
    } catch (error) {
        console.error('Service GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT update service
export async function PUT(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await request.json();
        const { name, duration, required_staff_type } = data;

        // Get current service for logging
        const [currentService] = await query('SELECT name FROM services WHERE id = ?', [id]);

        await query(
            'UPDATE services SET name = ?, duration = ?, required_staff_type = ? WHERE id = ?',
            [name, duration, required_staff_type, id]
        );

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Service "${currentService.name}" updated by ${session.user.email}`]
        );

        return NextResponse.json({ success: true, message: 'Service updated successfully' });
    } catch (error) {
        console.error('Service PUT error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE service
export async function DELETE(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        // Get service name for logging
        const [service] = await query('SELECT name FROM services WHERE id = ?', [id]);

        await query('DELETE FROM services WHERE id = ?', [id]);

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Service "${service.name}" deleted by ${session.user.email}`]
        );

        return NextResponse.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Service DELETE error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}