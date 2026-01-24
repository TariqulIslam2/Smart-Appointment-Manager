import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Check if user already exists
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await query(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, email.split('@')[0]]
        );

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error during signup' },
            { status: 500 }
        );
    }
}