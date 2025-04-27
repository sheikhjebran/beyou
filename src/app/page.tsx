
"use client"; // Add this directive for state management

import { useState } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { mockProducts } from '@/lib/mock-data';
import { Header } from '@/components/header';
import Image from 'next/image';
import type { Product } from '@/types/product'; // Import Product type

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = mockProducts.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Pass setSearchTerm to Header */}
      <Header onSearchChange={setSearchTerm} />
      <main className="flex-1 container mx-auto">
        {/* Banner Section */}
        <section className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden my-8 shadow-lg">
          <Image
            src="https://picsum.photos/seed/herobanner/1200/500" // Placeholder banner image
            alt="BeYou Banner"
            layout="fill"
            objectFit="cover"
            priority // Load banner image faster
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Discover Your Style
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
              Explore our curated collection of the latest trends in beauty and fashion. Find pieces that express your unique elegance.
            </p>
            {/* Optional Call to Action Button */}
            {/*
            <Link href="#products" passHref legacyBehavior>
               <Button size="lg" variant="secondary">Shop Now</Button>
            </Link>
             */}
          </div>
        </section>

        {/* Product Grid Section */}
        <section id="products" className="p-6">
           <h2 className="mb-8 text-3xl font-bold tracking-tight text-center">Our Products</h2>
           {/* Pass filtered products to ProductGrid */}
           <ProductGrid products={filteredProducts} />
            {/* Show message if no products match search */}
           {filteredProducts.length === 0 && searchTerm && (
             <p className="text-center text-muted-foreground mt-8">
                No products found matching "{searchTerm}".
             </p>
            )}
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}
