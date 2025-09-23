import { NextResponse } from 'next/server';
import mysql from '@/lib/server/mysql';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookiesList = await cookies();
    const authToken = cookiesList.get('admin_token')?.value;

    if (!authToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch sales data for the past 30 days
    const [rows] = await mysql.query(
      `SELECT 
        DATE(sale_date) as date,
        SUM(total_amount) as total
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(sale_date)
       ORDER BY date`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
