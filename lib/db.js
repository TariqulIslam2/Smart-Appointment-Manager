import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'appointment_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
}

export async function getConnection() {
    return await pool.getConnection();
}