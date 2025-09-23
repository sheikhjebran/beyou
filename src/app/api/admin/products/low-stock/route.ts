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

    // Fetch low stock products (quantity less than 10)
    const [rows] = await mysql.query(
      `SELECT 
        id,
        name,
        stock_quantity,
        category
       FROM products
       WHERE stock_quantity < 10
       ORDER BY stock_quantity ASC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
