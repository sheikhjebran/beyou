
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, PackageX, BarChart3, List, Clock, CalendarDays, Eye, ShoppingBag, BarChart2 } from 'lucide-react';
import type { Product } from '@/types/product';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/api-utils';
import { cookies } from 'next/headers';

// Fetch data on the server
async function getDashboardData() {
  try {
    // Get admin token from cookies
    const cookiesList = await cookies();
    const authToken = cookiesList.get('admin_token')?.value;

    if (!authToken) {
      throw new Error('Unauthorized - Please log in');
    }

    const response = await fetch(getApiUrl('/api/admin/dashboard'), {
      cache: 'no-store', // Don't cache dashboard data
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies in the request
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid dashboard data format received');
    }

    return data;
  } catch (error) {
    console.warn("Error fetching dashboard data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      products: [],
      totalProducts: 0,
      zeroQuantityProducts: [],
      recentProduct: null,
      ordersToday: 0,
      salesTodayAmount: 0,
      error: errorMessage,
    };
  }
}

export default async function AdminDashboardPage() {
  const { totalProducts, zeroQuantityProducts, recentProduct, ordersToday, salesTodayAmount, error } = await getDashboardData();
  
  const todayDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

   const formatTimestamp = (isoString: string | null | undefined): string => {
     if (!isoString) return 'N/A';
     try {
        const date = new Date(isoString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
         });
     } catch {
        return 'Invalid Date';
     }
   };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
       <div className="flex flex-col items-center text-center mb-6">
         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
           <LayoutDashboard className="h-8 w-8 text-primary" />
         </div>
         <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
         <p className="text-lg text-muted-foreground">Welcome, Admin! Manage your store below.</p>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-4">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error Loading Data</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total items in inventory</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <PackageX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{zeroQuantityProducts.length}</div>
             {zeroQuantityProducts.length > 0 ? (
                 <>
                     <p className="text-xs text-muted-foreground mb-2">Products with zero quantity</p>
                     <ul className="list-disc list-inside text-xs max-h-20 overflow-y-auto">
                        {zeroQuantityProducts.map((p: Product) => <li key={p.id} className="truncate">{p.name}</li>)}
                     </ul>
                 </>
             ) : (
                <p className="text-xs text-muted-foreground">All products are in stock</p>
             )}
             <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs" asChild>
               <Link href="/admin/inventory">View Inventory</Link>
             </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Recent Update</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentProduct ? (
              <>
                <div className="text-base font-semibold truncate">{recentProduct.name}</div>
                <p className="text-xs text-muted-foreground">
                    ID: {recentProduct.id.substring(0, 8)}...
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                    Updated: {formatTimestamp(recentProduct.updatedAt)}
                 </p>
             </>
            ) : !error ? (
              <div className="text-base font-semibold">N/A</div>
            ) : null}
             {!error && !recentProduct && <p className="text-xs text-muted-foreground mt-1">No products found.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
               Orders Today <span className="text-xs font-normal">({todayDate})</span>
            </CardTitle>
             <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersToday}</div>
            <p className="text-xs text-muted-foreground">Total sales transactions today</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-1">
               Sales Today (₹) <span className="text-xs font-normal">({todayDate})</span>
            </CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-bold">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesTodayAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total revenue from today's sales</p>
          </CardContent>
        </Card>

        <Link href="/admin/analytics" className="block">
            <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground pt-2 text-sm">
                  <p>View detailed product performance, including:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Most viewed products</li>
                      <li>Most purchased items</li>
                      <li>Popular selections</li>
                  </ul>
                </div>
                <p className="text-xs text-primary text-center mt-3 font-semibold">
                  Click to view details
                </p>
              </CardContent>
            </Card>
        </Link>

      </div>
    </div>
  );
}
