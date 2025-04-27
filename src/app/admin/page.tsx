
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, PackageX, BarChart3, List, Clock, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { getProducts } from '@/services/productService';
import type { Product } from '@/types/product';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Fetch data on the server
async function getDashboardData() {
  try {
    const products = await getProducts();
    const totalProducts = products.length;
    const zeroQuantityProducts = products.filter(p => p.quantity === 0);
    // Placeholder for recent product - ideally sort by createdAt if available
    // This still requires a timestamp field in the product data for accurate sorting
    const recentProduct = products.length > 0 ? products[0] : null;
    return {
      products,
      totalProducts,
      zeroQuantityProducts,
      recentProduct, // This is just the first product fetched, not necessarily the most recent
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      products: [],
      totalProducts: 0,
      zeroQuantityProducts: [],
      recentProduct: null,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export default async function AdminDashboardPage() {
  const { totalProducts, zeroQuantityProducts, recentProduct, error } = await getDashboardData();
  const todayDate = new Date().toLocaleDateString(); // Get today's date

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
       {/* Welcome Header */}
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

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total Products Card */}
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

        {/* Zero Quantity Products Card */}
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
                        {zeroQuantityProducts.map(p => <li key={p.id} className="truncate">{p.name}</li>)}
                     </ul>
                 </>
             ) : (
                <p className="text-xs text-muted-foreground">All products are in stock</p>
             )}
             <Link href="/admin/inventory" passHref legacyBehavior>
                 <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">View Inventory</Button>
             </Link>
          </CardContent>
        </Card>

         {/* Recent Product Card (Placeholder) */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added (Example)</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentProduct ? (
              <>
                <div className="text-base font-semibold truncate">{recentProduct.name}</div>
                <p className="text-xs text-muted-foreground">
                    ID: {recentProduct.id.substring(0, 8)}... (Note: Needs timestamp for accuracy)
                </p>
             </>
            ) : (
              <div className="text-base font-semibold">N/A</div>
            )}
             <p className="text-xs text-muted-foreground mt-1">Requires product creation timestamp</p>
          </CardContent>
        </Card>

        {/* Orders Today Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
               Orders Today <span className="text-xs font-normal">({todayDate})</span>
            </CardTitle>
             <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {/* Replace placeholder with 0 */}
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Requires order tracking system</p>
          </CardContent>
        </Card>

        {/* Sales Today Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-1">
               Sales Today (₹) <span className="text-xs font-normal">({todayDate})</span>
            </CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-bold">₹</span>
          </CardHeader>
          <CardContent>
             {/* Replace placeholder with 0 */}
            <div className="text-2xl font-bold">0.00</div>
            <p className="text-xs text-muted-foreground">Requires sales data integration</p>
          </CardContent>
        </Card>

         {/* Analytics Card (Placeholder) */}
         <Card className="shadow-md hover:shadow-lg transition-shadow bg-secondary/30">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Analytics Overview</CardTitle>
             <BarChart3 className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-muted-foreground text-center pt-4">
                 Analytics chart placeholder
             </div>
             <p className="text-xs text-muted-foreground text-center mt-2">More detailed analytics coming soon</p>
           </CardContent>
         </Card>

      </div>
    </div>
  );
}
