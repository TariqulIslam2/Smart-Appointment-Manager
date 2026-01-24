import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all staff
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const date = searchParams.get('date');

        let sql = 'SELECT * FROM staff WHERE 1=1';
        const params = [];

        if (type) {
            sql += ' AND service_type = ?';
            params.push(type);
        }

        sql += ' ORDER BY name';

        const staff = await query(sql, params);

        // If date is provided, calculate appointment count for each staff
        if (date) {
            for (const s of staff) {
                const [result] = await query(
                    `SELECT COUNT(*) as count FROM appointments 
           WHERE staff_id = ? AND appointment_date = ? 
           AND status IN ('scheduled', 'completed')`,
                    [s.id, date]
                );
                s.appointment_count = result.count || 0;
            }
        }

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Staff GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create new staff
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, service_type, daily_capacity = 5, status = 'available' } = data;

        // Validate required fields
        if (!name || !service_type) {
            return NextResponse.json(
                { error: 'Name and service type are required' },
                { status: 400 }
            );
        }

        const result = await query(
            'INSERT INTO staff (name, service_type, daily_capacity, status) VALUES (?, ?, ?, ?)',
            [name, service_type, daily_capacity, status]
        );

        // Log activity
        await query(
            'INSERT INTO activity_log (action) VALUES (?)',
            [`Staff "${name}" created by ${session.user.email}`]
        );

        return NextResponse.json({
            success: true,
            id: result.insertId,
            message: 'Staff created successfully'
        });
    } catch (error) {
        console.error('Staff POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}