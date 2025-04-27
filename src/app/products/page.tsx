
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product-grid';
import { Header } from '@/components/header';
import type { Product } from '@/types/product';
import { getProducts } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"


function ProductsContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from Firestore on component mount
    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            setError(null);
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to load products on products page:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    // Filter products based on category and sub-category
    const filteredProducts = products.filter((product: Product) => {
        if (!category) return true; // Show all if no category filter
        if (product.category !== category) return false; // Filter by category
        if (subCategory && product.subCategory !== subCategory) return false; // Filter by sub-category if present
        return true; // Product matches filters
    });

    const pageTitle = subCategory ? `${category} > ${subCategory}` : category ? `${category}` : 'All Products';

    return (
        <main className="flex-1 container mx-auto p-6">

             {/* Breadcrumbs and Title */}
             <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <Breadcrumb>
                 <BreadcrumbList>
                   <BreadcrumbItem>
                     <BreadcrumbLink href="/">Home</BreadcrumbLink>
                   </BreadcrumbItem>
                   <BreadcrumbSeparator />
                   <BreadcrumbItem>
                     <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                   </BreadcrumbItem>
                   {category && (
                     <>
                       <BreadcrumbSeparator />
                       <BreadcrumbItem>
                         {subCategory ? (
                           <BreadcrumbLink href={`/products?category=${encodeURIComponent(category)}`}>
                             {category}
                           </BreadcrumbLink>
                         ) : (
                           <BreadcrumbPage>{category}</BreadcrumbPage>
                         )}
                       </BreadcrumbItem>
                     </>
                   )}
                   {subCategory && (
                     <>
                       <BreadcrumbSeparator />
                       <BreadcrumbItem>
                         <BreadcrumbPage>{subCategory}</BreadcrumbPage>
                       </BreadcrumbItem>
                     </>
                   )}
                 </BreadcrumbList>
               </Breadcrumb>
                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-right flex items-center gap-2">
                     <Filter className="h-6 w-6 text-primary hidden sm:inline-block" />
                     {pageTitle}
                 </h1>
             </div>


            {error && (
                <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Products</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                // Skeleton Grid while loading
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={`skeleton-card-${index}`} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg">
                            <CardHeader className="p-0">
                                <Skeleton className="aspect-[4/3] w-full bg-muted" />
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-1/3 mt-2" />
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                // Actual Product Grid or No Products Message
                filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <p className="text-center text-muted-foreground mt-16 text-lg">
                        No products found matching the selected criteria.
                    </p>
                )
            )}
        </main>
    );
}


export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header without search */}
      <Header />
       {/* Wrap ProductsContent in Suspense to handle searchParams */}
       <Suspense fallback={<div>Loading filters...</div>}>
         <ProductsContent />
       </Suspense>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}

