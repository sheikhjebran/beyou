
"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import { ProductGrid } from '@/components/product-grid';
// import { mockProducts } from '@/lib/mock-data'; // Remove mock data import
import { Header } from '@/components/header';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { getProducts } from '@/services/productService'; // Import service function
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { AlertCircle } from 'lucide-react'; // Import icon


export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]); // State for products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state


  // Fetch products from Firestore on component mount
   useEffect(() => {
     async function loadProducts() {
       setLoading(true);
       setError(null);
       try {
         const fetchedProducts = await getProducts();
         setProducts(fetchedProducts);
       } catch (err) {
          console.error("Failed to load products on home page:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching products.");
       } finally {
         setLoading(false);
       }
     }
     loadProducts();
   }, []);


  // Filter products based on search term and fetched data
  const filteredProducts = products.filter((product: Product) =>
    (product.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSearchChange={setSearchTerm} />
      <main className="flex-1 container mx-auto">
        {/* Banner Section */}
        <section className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden my-8 shadow-lg">
          <Image
            src="https://picsum.photos/seed/herobanner/1200/500"
            alt="BeYou Banner"
             fill // Use fill instead of layout
             style={{ objectFit: 'cover' }} // Add objectFit style
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Discover Your Style
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
              Explore our curated collection of the latest trends in beauty and fashion. Find pieces that express your unique elegance.
            </p>
          </div>
        </section>

        {/* Product Grid Section */}
        <section id="products" className="p-6">
           <h2 className="mb-8 text-3xl font-bold tracking-tight text-center">Our Products</h2>

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
                 <p className="text-center text-muted-foreground mt-8">
                   {searchTerm
                     ? `No products found matching "${searchTerm}".`
                     : "No products currently available. Check back soon!"}
                 </p>
               )
            )}
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}

// Re-add Card components for Skeleton
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
