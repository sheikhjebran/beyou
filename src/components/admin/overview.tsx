'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";

interface ProductStock {
  name: string;
  stock_quantity: number;
}

export function Overview() {
  const [data, setData] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductStock() {
      try {
        const response = await fetch('/api/admin/products/stock', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch product stock data');
        const stockData = await response.json();
        
        // Sort by stock quantity and take top 10 products
        const sortedData = stockData
          .sort((a: ProductStock, b: ProductStock) => b.stock_quantity - a.stock_quantity)
          .slice(0, 10);
        
        setData(sortedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching product stock:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductStock();
  }, []);

  if (loading) return <div>Loading stock data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Product Stock Levels</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p>Stock: {payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              name="Stock Quantity"
              dataKey="stock_quantity"
              fill="hsl(35 100% 60%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
