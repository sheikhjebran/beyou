
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { LogIn, ShoppingCart, Search } from 'lucide-react'; // Import Search icon
import { useCart } from '@/hooks/use-cart'; // Import the useCart hook
import { Badge } from '@/components/ui/badge'; // Import Badge
import { useState } from 'react'; // Import useState

// Define props for the Header component
interface HeaderProps {
  onSearchChange?: (term: string) => void; // Optional callback for search input changes
}

export function Header({ onSearchChange }: HeaderProps) {
  const { getTotalItems } = useCart(); // Get cart functions
  const totalItems = getTotalItems();
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setLocalSearchTerm(term);
    if (onSearchChange) {
      onSearchChange(term); // Call the passed function when search changes
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight mr-4 shrink-0">
          BeYou
        </Link>

        {/* Search Input - Conditionally render if onSearchChange is provided */}
        {onSearchChange && (
         <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-lg bg-background pl-8 h-9"
              value={localSearchTerm}
              onChange={handleSearchInputChange}
              aria-label="Search products"
            />
          </div>
        )}

        <nav className="flex items-center space-x-2 sm:space-x-4 shrink-0">
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
           {/* Link for larger screens */}
           <Link href="/login" passHref legacyBehavior>
             <Button variant="outline" size="sm" className="hidden sm:inline-flex" aria-label="Admin Login">
               <LogIn className="mr-1.5 h-4 w-4" />
               Admin
             </Button>
           </Link>
            {/* Link for smaller screens */}
           <Link href="/login" passHref legacyBehavior>
             <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Admin Login">
               <LogIn className="h-5 w-5" />
             </Button>
           </Link>
        </nav>
      </div>
    </header>
  );
}

