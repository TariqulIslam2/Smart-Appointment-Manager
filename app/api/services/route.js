import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all services
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const services = await query('SELECT * FROM services ORDER BY name');
        return NextResponse.json(services);
    } catch (error) {
        console.error('Services GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create new service
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, duration, required_staff_type } = data;

        // Validate required fields
        if (!name || !duration || !required_staff_type) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate duration
        const validDurations = [15, 30, 45, 60, 90, 120];
        if (!validDurations.includes(parseInt(duration))) {
            return NextResponse.json(
                { error: 'Duration must be 15, 30, 45, 60, 90, 120 minutes' },
                { status: 400 }
            );
        }

        const result = await query(
            'INSERT INTO services (name, duration, required_staff_type) VALUES (?, ?, ?)',
            [name, duration, required_staff_type]
        );

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Service "${name}" created by ${session.user.email}`]
        );

        return NextResponse.json({
            success: true,
            id: result.insertId,
            message: 'Service created successfully'
        });
    } catch (error) {
        console.error('Services POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}