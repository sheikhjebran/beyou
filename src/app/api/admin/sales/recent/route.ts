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

    // Fetch recent sales with product details
    const [rows] = await mysql.query(
      `SELECT 
        s.id,
        p.name as productName,
        s.quantity_sold as quantity,
        s.total_amount as amount,
        s.sale_date as date
       FROM sales s
       JOIN products p ON s.product_id = p.id
       ORDER BY s.sale_date DESC
       LIMIT 10`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
