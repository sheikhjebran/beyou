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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface ProductStock {
  name: string;
  stock_quantity: number;
  category?: string;
}

interface CategoryStock {
  category: string;
  total_stock: number;
  product_count: number;
  avg_stock: number;
}

type ViewMode = 'products' | 'categories' | 'low_stock';

export function Overview() {
  const [productData, setProductData] = useState<ProductStock[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [productLimit, setProductLimit] = useState(10);

  useEffect(() => {
    fetchStockData();
  }, []);

  async function fetchStockData() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products/stock', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch product stock data');
      const stockData: ProductStock[] = await response.json();
      
      // Set product data (sorted by stock quantity)
      setProductData(stockData.sort((a, b) => b.stock_quantity - a.stock_quantity));
      
      // Aggregate by category
      const categoryMap = new Map<string, { total: number; count: number }>();
      stockData.forEach(product => {
        const category = product.category || 'Uncategorized';
        const existing = categoryMap.get(category) || { total: 0, count: 0 };
        categoryMap.set(category, {
          total: existing.total + product.stock_quantity,
          count: existing.count + 1
        });
      });
      
      const categoryStats: CategoryStock[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        total_stock: stats.total,
        product_count: stats.count,
        avg_stock: Math.round(stats.total / stats.count)
      })).sort((a, b) => b.total_stock - a.total_stock);
      
      setCategoryData(categoryStats);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching product stock:', err);
    } finally {
      setLoading(false);
    }
  }

  const getCurrentData = () => {
    switch (viewMode) {
      case 'products':
        return productData.slice(0, productLimit).map(item => ({
          name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
          value: item.stock_quantity,
          fullName: item.name
        }));
      case 'categories':
        return categoryData.map(item => ({
          name: item.category,
          value: item.total_stock,
          fullName: `${item.category} (${item.product_count} products)`,
          avgStock: item.avg_stock
        }));
      case 'low_stock':
        return productData
          .filter(item => item.stock_quantity <= 10)
          .slice(0, 15)
          .map(item => ({
            name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
            value: item.stock_quantity,
            fullName: item.name
          }));
      default:
        return [];
    }
  };

  const getChartTitle = () => {
    switch (viewMode) {
      case 'products':
        return `Top ${productLimit} Products by Stock`;
      case 'categories':
        return 'Stock by Category';
      case 'low_stock':
        return 'Low Stock Alert (≤10 items)';
      default:
        return 'Stock Overview';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-32">Loading stock data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const data = getCurrentData();

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">{getChartTitle()}</h3>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="categories">By Category</SelectItem>
              <SelectItem value="products">Top Products</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
          
          {viewMode === 'products' && (
            <Select value={productLimit.toString()} onValueChange={(value) => setProductLimit(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchStockData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={viewMode === 'categories' ? 0 : -35}
              textAnchor={viewMode === 'categories' ? 'middle' : 'end'}
              height={60}
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
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold text-sm">{data.fullName}</p>
                      <p className="text-blue-600">Stock: {payload[0].value}</p>
                      {data.avgStock && (
                        <p className="text-gray-500 text-xs">Avg per product: {data.avgStock}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              name={viewMode === 'categories' ? 'Total Stock' : 'Stock Quantity'}
              dataKey="value"
              fill={viewMode === 'low_stock' ? 'hsl(0 70% 50%)' : viewMode === 'categories' ? 'hsl(142 71% 45%)' : 'hsl(35 100% 60%)'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-semibold text-lg">{categoryData.length}</p>
            <p className="text-muted-foreground">Categories</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{productData.length}</p>
            <p className="text-muted-foreground">Total Products</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{productData.reduce((sum, p) => sum + p.stock_quantity, 0)}</p>
            <p className="text-muted-foreground">Total Stock</p>
          </div>
        </div>
      )}

      {viewMode === 'low_stock' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">
            <strong>{productData.filter(p => p.stock_quantity <= 10).length}</strong> products have low stock (≤10 items).
            Consider restocking soon.
          </p>
        </div>
      )}
    </div>
  );
}
