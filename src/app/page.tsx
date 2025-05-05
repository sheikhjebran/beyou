

"use client";

import { useState, useEffect } from 'react'; // Kept for potential future use, e.g., dynamic banner content
// import { ProductGrid } from '@/components/product-grid'; // Removed ProductGrid
// import type { Product } from '@/types/product'; // Removed Product type
// import { getProducts } from '@/services/productService'; // Removed product service
import { Header } from '@/components/header';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton'; // Keep Skeleton for potential loading states if needed
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Keep Alert for potential errors
import { AlertCircle, Tag } from 'lucide-react'; // Added Tag icon for categories
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Keep Card components
import Link from 'next/link'; // Keep Link
import { getMainCategories } from '@/lib/categories'; // Import category helper

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  // Removed product-related state: products, loading, error

  // Removed useEffect hook for fetching products

  // Removed product filtering logic

  const categories = getMainCategories(); // Get category list

  return (
    <div className="flex min-h-screen flex-col">
      {/* Pass setSearchTerm to Header to enable search functionality */}
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
            data-ai-hint="beauty fashion banner"
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

        {/* Category Grid Section - Replaced Product Grid */}
        <section id="categories" className="p-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-center text-foreground">Explore Our Categories</h2>

          {/* Removed product error handling */}
          {/* Removed product loading skeleton */}

           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {categories.map((category) => (
               <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} passHref legacyBehavior>
                 <a className="group block"> {/* Make the anchor tag the group */}
                   <Card className="w-full overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                     <CardHeader className="p-0">
                       <div className="relative aspect-[4/3] w-full">
                         <Image
                           // Using picsum with a seed based on category name for variety
                           src={`https://picsum.photos/seed/${encodeURIComponent(category)}/400/300`}
                           alt={`${category} category`}
                           fill
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                           style={{ objectFit: 'cover' }}
                           className="transition-opacity duration-300 group-hover:opacity-90"
                           data-ai-hint={`${category.toLowerCase()} category image`} // AI Hint for images
                         />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                       </div>
                     </CardHeader>
                     <CardContent className="p-4 bg-card/80 backdrop-blur-sm">
                       <div className="flex items-center gap-2">
                         <Tag className="h-5 w-5 text-primary shrink-0" />
                         <CardTitle className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                           {category}
                         </CardTitle>
                       </div>
                        {/* Optional: Add a short description or sub-category count later */}
                       {/* <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-1">
                         Explore {category} products...
                       </CardDescription> */}
                     </CardContent>
                   </Card>
                 </a>
               </Link>
             ))}
           </div>

            {/* Removed No Products Message */}
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}

