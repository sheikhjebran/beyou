
"use client";

import { useState } from 'react';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingImage } from './loading-image'; // Import LoadingImage
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [note, setNote] = useState('');

  const handleQuantityChange = (amount: number) => {
    setSelectedQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      const maxAllowed = Math.min(product.quantity > 0 ? product.quantity : 100, 100);
      if (newQuantity > maxAllowed) return maxAllowed;
      return newQuantity;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
        setSelectedQuantity(1);
        return;
    }
    const numValue = parseInt(value, 10);
    const maxAllowed = Math.min(product.quantity > 0 ? product.quantity : 100, 100);

    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxAllowed) {
        setSelectedQuantity(numValue);
    } else if (numValue < 1) {
        setSelectedQuantity(1);
    } else if (numValue > maxAllowed) {
        setSelectedQuantity(maxAllowed);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedQuantity, note);
    toast({
      title: "Added to Cart",
      description: `${product.name} (x${selectedQuantity}) has been added to your cart.`,
    });
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
      <div>
        <CardHeader className="p-0">
          <Link href={`/product/${product.id}`} passHref legacyBehavior>
            <a className="block relative aspect-[4/3] w-full group">
              <LoadingImage
                src={product.primaryImageUrl || 'https://placehold.co/400x300.png'}
                alt={product.name}
                fill
                sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 22vw"
                imgClassName={cn(
                  "object-cover transition-transform duration-300 group-hover:scale-105",
                  product.quantity === 0 && "blur-sm"
                )}
                data-ai-hint="product fashion beauty"
                loadingText="Loading image..."
              />
              {product.quantity === 0 && (
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
            </a>
          </Link>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-1 sm:mb-2 flex items-start justify-between gap-2">
            <Link href={`/product/${product.id}`} passHref legacyBehavior>
              <a className="hover:text-primary transition-colors">
                <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
              </a>
            </Link>
          </div>
          <CardDescription className="hidden sm:block sm:line-clamp-2 mb-3 text-sm text-muted-foreground">
            {product.description}
          </CardDescription>
          <div className="text-lg font-bold text-foreground mb-3 sm:hidden">
            ₹{product.price.toFixed(2)}
          </div>
          <div className="hidden sm:block text-lg font-bold text-foreground mb-3">
            ₹{product.price.toFixed(2)}
          </div>
          
          <div className="hidden sm:block space-y-1.5 mt-4">
            <Label htmlFor={`quantity-${product.id}`} className="text-xs font-medium text-muted-foreground">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => handleQuantityChange(-1)}
                disabled={selectedQuantity <= 1 || product.quantity === 0}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id={`quantity-${product.id}`}
                type="number"
                value={selectedQuantity}
                onChange={handleInputChange}
                min="1"
                max={product.quantity > 0 ? Math.min(product.quantity, 100) : 0}
                className="h-8 w-14 text-center rounded-md"
                aria-label="Product quantity"
                disabled={product.quantity === 0}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => handleQuantityChange(1)}
                disabled={selectedQuantity >= (product.quantity > 0 ? Math.min(product.quantity, 100) : 0) || product.quantity === 0}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="hidden sm:block space-y-1.5 mt-3">
            <Label htmlFor={`note-${product.id}`} className="text-xs font-medium text-muted-foreground">Note (Optional)</Label>
            <Textarea
              id={`note-${product.id}`}
              placeholder="Add a special request..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[50px] resize-none text-sm rounded-md"
              rows={2}
              disabled={product.quantity === 0}
            />
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-3 sm:p-4 pt-1 sm:pt-2 mt-auto">
        <Button
          className="w-full h-9 sm:h-auto"
          aria-label={`Add ${product.name} to cart`}
          onClick={handleAddToCart}
          disabled={product.quantity === 0 || selectedQuantity > product.quantity}
        >
          <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
