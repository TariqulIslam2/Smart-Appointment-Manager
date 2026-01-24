import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const staffTypes = await query(
            'SELECT DISTINCT service_type FROM staff ORDER BY service_type'
        );

        const types = staffTypes.map(row => row.service_type);

        return NextResponse.json(types);
    } catch (error) {
        console.error('Staff types GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}