"use client";

import type { Product } from '@/types/product';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart'; // Import useCart hook
import { useToast } from "@/hooks/use-toast"; // Import useToast hook

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart(); // Get addToCart function
  const { toast } = useToast(); // Get toast function

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority // Load images above the fold faster
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
          <Badge variant={product.type === 'Beauty' ? 'default' : 'secondary'} className="capitalize">
            {product.type}
          </Badge>
        </div>
        <CardDescription className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </CardDescription>
        <div className="text-lg font-bold text-primary">
          ${product.price.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Button
            className="w-full"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart} // Call handleAddToCart on click
          >
           <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
         </Button>
      </CardFooter>
    </Card>
  );
}
