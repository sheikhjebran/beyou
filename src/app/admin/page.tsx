
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, PackageX, BarChart3, List, Clock, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { getProducts, getMostRecentProduct } from '@/services/productService'; // Import getMostRecentProduct
import type { Product } from '@/types/product';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Fetch data on the server
async function getDashboardData() {
  try {
    // Fetch all products for counts
    const products = await getProducts();
    const totalProducts = products.length;
    const zeroQuantityProducts = products.filter(p => p.quantity === 0);

    // Fetch the single most recent product separately
    // This function already returns serialized timestamps
    const recentProduct = await getMostRecentProduct();

    return {
      products, // Keep this if needed elsewhere
      totalProducts,
      zeroQuantityProducts,
      recentProduct, // This object contains serializable timestamps
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Return default values on error, including the error message
    return {
      products: [],
      totalProducts: 0,
      zeroQuantityProducts: [],
      recentProduct: null,
      error: errorMessage,
    };
  }
}

export default async function AdminDashboardPage() {
  const { totalProducts, zeroQuantityProducts, recentProduct, error } = await getDashboardData();
  const todayDate = new Date().toLocaleDateString('en-IN', { // Use Indian locale for date format
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

   // Function to format the timestamp for display
   const formatTimestamp = (isoString: string | null | undefined): string => {
     if (!isoString) return 'N/A';
     try {
        const date = new Date(isoString);
        return date.toLocaleString('en-IN', { // Use locale for better readability
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

         {/* Recent Product Card (Actual) */}
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
                 {/* Display formatted timestamp */}
                 <p className="text-xs text-muted-foreground mt-1">
                    Updated: {formatTimestamp(recentProduct.updatedAt)}
                 </p>
                 {/* Optionally display createdAt if different */}
                 {/* {recentProduct.createdAt !== recentProduct.updatedAt && (
                    <p className="text-xs text-muted-foreground">
                        Created: {formatTimestamp(recentProduct.createdAt)}
                    </p>
                 )} */}
             </>
            ) : !error ? ( // Only show N/A if there wasn't a loading error
              <div className="text-base font-semibold">N/A</div>
            ) : null}
             {!error && !recentProduct && <p className="text-xs text-muted-foreground mt-1">No products found.</p>}
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
