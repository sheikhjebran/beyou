
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2, ShoppingBag, Plus, Minus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import LoadingImage from '@/components/loading-image';
import { cn } from '@/lib/utils';

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [currentDisplayImageIndex, setCurrentDisplayImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (amount: number) => {
    setSelectedQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      const maxQty = product ? (product.stock_quantity > 0 ? Math.min(product.stock_quantity, 100) : 0) : 100;
      if (newQuantity > maxQty && maxQty > 0) return maxQty;
      if (newQuantity > 100) return 100;
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
    const maxQty = product ? (product.stock_quantity > 0 ? Math.min(product.stock_quantity, 100) : 0) : 100;

    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQty) {
      setSelectedQuantity(numValue);
    } else if (numValue < 1) {
      setSelectedQuantity(1);
    } else if (numValue > maxQty && maxQty > 0) {
      setSelectedQuantity(maxQty);
    } else if (maxQty === 0 && numValue > 0) {
      setSelectedQuantity(0);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedQuantity, note);
    toast({
      title: 'Added to Cart',
      description: `${product.name} (x${selectedQuantity}) has been added to your cart.`,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name} from BeYou!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: 'Product Shared!', description: `${product.name} link shared successfully.` });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          let toastDescription = 'Could not share the product link.';
          if (error instanceof DOMException && error.name === 'NotAllowedError') {
            toastDescription = 'Browser permission for sharing was denied. Ensure the page is on HTTPS and sharing is allowed.';
          }
          toast({ variant: 'destructive', title: 'Sharing Failed', description: toastDescription });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: 'Link Copied!', description: 'Product link copied to clipboard.' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the product link to clipboard.' });
      }
    }
  };

  // Reorder display images to ensure primary is first and validate URLs
  const displayImages = React.useMemo(() => {
    if (!product) return ['/images/placeholder.png'];
    
    const validateUrl = (url: string) => {
      if (!url) return false;
      try {
        new URL(url.startsWith('http') ? url : `http://${url}`);
        return true;
      } catch {
        return false;
      }
    };

    const imageUrls = (product.image_paths || []).filter(validateUrl);
    const primaryUrl = product.primary_image_path;
    
    if (primaryUrl && validateUrl(primaryUrl)) {
      const otherImages = imageUrls.filter((url: string) => url !== primaryUrl);
      return [primaryUrl, ...otherImages];
    }
    
    return imageUrls.length > 0 ? imageUrls : ['/images/placeholder.png'];
  }, [product]);

  const currentDisplayImageSrc = displayImages[currentDisplayImageIndex];

  const nextImage = () => {
    setCurrentDisplayImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentDisplayImageIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="grid md:grid-cols-2 items-start">
      <div className="p-4 md:p-6">
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden shadow-inner">
          <LoadingImage
            src={currentDisplayImageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 90vw, 45vw"
            imgClassName={cn(
              "object-cover",
              product.stock_quantity === 0 && "blur-sm"
            )}
            priority={true}
            key={currentDisplayImageSrc}
            data-ai-hint="product fashion beauty"
          />
          {product.stock_quantity === 0 && (
            <>
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <Badge
                variant="destructive"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg p-4 z-20"
              >
                Out of Stock
              </Badge>
            </>
          )}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-20"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        {displayImages.length > 1 && (
          <div className="mt-4 flex justify-center space-x-2 overflow-x-auto pb-2">
            {displayImages.map((imgUrl: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentDisplayImageIndex(index)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all ${
                  currentDisplayImageIndex === index ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-muted-foreground/50'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <LoadingImage
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <div className="text-2xl font-semibold text-primary mb-3 mt-1">
            ₹{product.price.toFixed(2)}
          </div>
        </div>
        <Separator />
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>Description</h2>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Category:</h3>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">{product.category}</Badge>
            </Link>
          </div>
          {product.subcategory && product.subcategory.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">Sub-Category:</h3>
              <Link href={`/products?category=${encodeURIComponent(product.category)}&subCategory=${encodeURIComponent(product.subcategory)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">{product.subcategory}</Badge>
              </Link>
            </div>
          )}
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor={`quantity-${product.id}`} className="text-base font-medium">Quantity</Label>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleQuantityChange(-1)} disabled={selectedQuantity <= 1 || product.stock_quantity === 0} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </Button>
            <Input id={`quantity-${product.id}`} type="number" value={selectedQuantity} onChange={handleInputChange} min="1"
              max={product.stock_quantity > 0 ? Math.min(product.stock_quantity, 100) : 0}
              className="h-9 w-20 text-center text-base" aria-label="Product quantity"
              disabled={product.stock_quantity === 0} />
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleQuantityChange(1)}
              disabled={selectedQuantity >= (product.stock_quantity > 0 ? Math.min(product.stock_quantity, 100) : 0) || product.stock_quantity === 0}
              aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`note-${product.id}`} className="text-base font-medium">Note (Optional)</Label>
          <Textarea id={`note-${product.id}`} placeholder="Add a special request or note for this item..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[80px] resize-none text-sm" disabled={product.stock_quantity === 0} />
        </div>
        <div className="space-y-3">
          <Button className="w-full text-base py-3" aria-label={`Add ${product.name} to cart`} onClick={handleAddToCart} disabled={product.stock_quantity === 0 || selectedQuantity > product.stock_quantity}>
            <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
          <Button
            variant="outline"
            className="w-full text-base py-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent"
            onClick={handleShare}
            disabled={!product}
            title="Share this product"
          >
            <Share2 className="mr-2 h-5 w-5" /> Share Product
          </Button>
        </div>
      </div>
    </div>
  );
}

