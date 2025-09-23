'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function BestSellingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await getProducts(1, 10, { isBestSeller: true });
        setProducts(result.products);
      } catch (err) {
        console.error('Failed to fetch best selling products:', err);
        setError('Failed to load best selling products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse text-muted-foreground">Loading best sellers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No best selling products to display at the moment.
      </p>
    );
  }

  return (
    <ScrollArea>
      <div className="flex space-x-4 pb-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="min-w-[250px] w-[250px]"
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
