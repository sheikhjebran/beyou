
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product-grid';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Product } from '@/types/product';
import { getProducts } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Filter, Instagram, Youtube } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
// Removed: import type { Metadata } from 'next';

// The problematic metadata export has been removed.
// Page title will be updated by useEffect in ProductsContent.
// Other SEO metadata for /products should be handled by root layout defaults or other strategies.

function ProductsContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const rawSearchQuery = searchParams.get('q');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            setError(null);
            try {
                const result = await getProducts(1, 50); // Get first 50 products
                setProducts(result.products);
            } catch (err) {
                console.warn("Failed to load products on products page:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const normalizedSearchQuery = useMemo(() => {
        return rawSearchQuery ? rawSearchQuery.trim().toLowerCase() : null;
    }, [rawSearchQuery]);

    const filteredProducts = useMemo(() => {
        if (loading) return [];

        const filtered = products.filter((product: Product) => {
            const matchesCategory = !category || product.category === category;
            const matchesSubCategory = !subCategory || product.subcategory === subCategory;

            const matchesSearch = !normalizedSearchQuery ||
                product.name.toLowerCase().includes(normalizedSearchQuery) ||
                (product.description && product.description.toLowerCase().includes(normalizedSearchQuery));            return matchesCategory && matchesSubCategory && matchesSearch;
        });
        
        // Sort the filtered products to show out-of-stock items last
        return filtered.sort((a, b) => {
            const aInStock = a.stock_quantity > 0;
            const bInStock = b.stock_quantity > 0;
            if (aInStock && !bInStock) return -1; // a comes first
            if (!aInStock && bInStock) return 1;  // b comes first
            return 0; // maintain original order if both are in/out of stock
        });

    }, [products, category, subCategory, normalizedSearchQuery, loading]);

    const pageTitle = useMemo(() => {
      if (normalizedSearchQuery) return `Search results for "${rawSearchQuery}"`;
      if (subCategory) return `${category} > ${subCategory}`;
      if (category) return `${category}`;
      return 'All Products';
    }, [normalizedSearchQuery, rawSearchQuery, category, subCategory]);
    
    useEffect(() => {
        document.title = `${pageTitle} | BeYou`;
    }, [pageTitle]);


    return (
        <main className="flex-1 container mx-auto p-6">
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
                   {category && !normalizedSearchQuery && ( 
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
                   {subCategory && !normalizedSearchQuery && ( 
                     <>
                       <BreadcrumbSeparator />
                       <BreadcrumbItem>
                         <BreadcrumbPage>{subCategory}</BreadcrumbPage>
                       </BreadcrumbItem>
                     </>
                   )}
                   {rawSearchQuery && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Search</BreadcrumbPage>
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
                filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <p className="text-center text-muted-foreground mt-16 text-lg">
                        No products found matching your criteria.
                    </p>
                )
            )}
        </main>
    );
}

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
       <Suspense fallback={<div className="flex-1 container mx-auto p-6 text-center">Loading filters...</div>}>
         <ProductsContent />
       </Suspense>
      <Footer />
    </div>
  );
}
