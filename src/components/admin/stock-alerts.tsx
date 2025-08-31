'use client';

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  category: string;
}

export function StockAlerts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLowStockProducts() {
      try {
        const response = await fetch('/api/admin/products/low-stock', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch low stock products');
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLowStockProducts();
  }, []);

  if (loading) return <div>Loading stock alerts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.stock_quantity}</TableCell>
            <TableCell>
              <Badge 
                variant={product.stock_quantity === 0 ? "destructive" : "warning"}
              >
                {product.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
