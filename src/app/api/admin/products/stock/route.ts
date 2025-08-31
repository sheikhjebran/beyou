import { NextResponse } from 'next/server';
import mysql from '@/lib/server/mysql';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Verify admin authentication
    const cookiesList = await cookies();
    const authToken = cookiesList.get('admin_token')?.value;

    if (!authToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch product stock data
    const [rows] = await mysql.query(
      `SELECT 
        name,
        stock_quantity
       FROM products
       ORDER BY stock_quantity DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching product stock data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
