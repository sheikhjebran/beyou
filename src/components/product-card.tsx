'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { LoadingImage } from '@/components/loading-image';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
      <div>
        <CardHeader className="p-0">
          <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] w-full group">
            <LoadingImage
              src={product.primary_image_path || '/images/placeholder.png'}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 22vw"
              className={cn(
                "rounded-md object-cover transition-transform duration-300 group-hover:scale-105",
                product.stock_quantity === 0 && "blur-sm"
              )}
              data-ai-hint="product list item"
            />
            {product.stock_quantity === 0 && (
              <>
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <Badge
                  variant="destructive"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base z-20 px-4 py-2"
                >
                  Out of Stock
                </Badge>
              </>
            )}
          </Link>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-1 sm:mb-2 flex items-start justify-between gap-2">
            <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
              <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
            </Link>
          </div>
          <CardDescription className="hidden sm:block sm:line-clamp-2 mb-3 text-sm text-muted-foreground">
            {product.description}
          </CardDescription>
          <div className="text-lg font-bold text-foreground mb-3 sm:hidden">
            ₹{product.price.toFixed(2)}
          </div>
          <div className="space-y-1">
            <div className="hidden sm:flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">₹{product.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button 
          className="w-full" 
          variant={product.stock_quantity === 0 ? "outline" : "default"}
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
