import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/admin/overview";
import { RecentSales } from "@/components/admin/recent-sales";
import { ProductList } from "@/components/admin/product-list";
import { BannerManager } from "@/components/admin/banner-manager";
import { StockAlerts } from "@/components/admin/stock-alerts";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookiesList = await cookies();
  const authToken = cookiesList.get('admin_token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        {/* Analytics Overview */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading analytics...</div>}>
                <Overview />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Product Management */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading products...</div>}>
                  <ProductList />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading sales...</div>}>
                  <RecentSales />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stock Alerts and Banner Management */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading stock alerts...</div>}>
                <StockAlerts />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading banners...</div>}>
                <BannerManager />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
