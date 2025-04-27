"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart'; // Import the useCart hook
import { Badge } from '@/components/ui/badge'; // Import Badge

export function Header() {
  const { getTotalItems } = useCart(); // Get cart functions
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
          BeYou
        </Link>
        <nav className="flex items-center space-x-4">
           <Link href="/checkout" legacyBehavior passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
               <ShoppingCart className="h-5 w-5" />
               {totalItems > 0 && (
                 <Badge
                    variant="destructive" // Use destructive for visibility, or primary/secondary
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                 >
                    {totalItems}
                 </Badge>
               )}
             </Button>
           </Link>
          <Link href="/login" legacyBehavior passHref>
             <Button variant="outline" aria-label="Admin Login">
               <LogIn className="mr-2 h-4 w-4" />
               Admin Login
             </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
