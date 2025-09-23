'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SaleItem {
  id: string;
  productName: string;
  amount: number;
  quantity: number;
  date: string;
}

export function RecentSales() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentSales() {
      try {
        const response = await fetch('/api/admin/sales/recent', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch recent sales');
        const data = await response.json();
        setSales(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentSales();
  }, []);

  if (loading) return <div>Loading recent sales...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {sale.productName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.productName}</p>
            <p className="text-sm text-muted-foreground">
              Qty: {sale.quantity}
            </p>
          </div>
          <div className="ml-auto font-medium">₹{sale.amount.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
