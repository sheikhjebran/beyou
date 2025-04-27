
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { LogIn, ShoppingCart, Search, Menu } from 'lucide-react'; // Import Search icon, added Menu
import { useCart } from '@/hooks/use-cart'; // Import the useCart hook
import { Badge } from '@/components/ui/badge'; // Import Badge
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Import Sheet components

// Define props for the Header component
interface HeaderProps {
  onSearchChange?: (term: string) => void; // Optional callback for search input changes
}

export function Header({ onSearchChange }: HeaderProps) {
  const { getTotalItems } = useCart(); // Get cart functions
  const totalItems = getTotalItems();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isClientMounted, setIsClientMounted] = useState(false); // State to track client mount

  // Set isClientMounted to true only after the component mounts on the client
  useEffect(() => {
    setIsClientMounted(true);
  }, []);


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setLocalSearchTerm(term);
    // Call the parent component's state setter if provided
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  // Navigation Links Array
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#products", label: "All Products" },
    { href: "/", label: "Category" }, // Added Category link (pointing to home for now)
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="outline" size="icon">
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Open Menu</span>
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
               <nav className="flex flex-col space-y-4 p-4">
                 {navLinks.map((link) => (
                    <SheetClose asChild key={link.href + link.label + '-mobile'}>
                       <Link
                         href={link.href}
                         className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                       >
                         {link.label}
                       </Link>
                    </SheetClose>
                  ))}
                 {/* Search inside mobile menu */}
                 {onSearchChange && (
                    <div className="relative pt-4">
                       <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground mt-2" />
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
               </nav>
             </SheetContent>
           </Sheet>
         </div>


        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight mx-auto md:mx-0 md:mr-4 shrink-0">
          BeYou
        </Link>

        {/* Main Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 justify-center">
           {navLinks.map((link) => (
              <Link
                key={link.href + link.label + '-desktop'}
                href={link.href}
                className="text-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {/* Desktop Search Input - Conditionally render if onSearchChange is provided */}
          {onSearchChange && (
           <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md hidden md:block"> {/* Hide on small screens */}
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

           <Link href="/checkout" legacyBehavior passHref>
             <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
               <ShoppingCart className="h-5 w-5" />
               {/* Only render badge on client after mount to prevent hydration mismatch */}
               {isClientMounted && totalItems > 0 && (
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
        </div>

      </div>
        {/* Search bar shown below header on small screens (moved inside mobile menu) */}
       {/* {onSearchChange && (
         <div className="container pb-3 md:hidden">
            <div className="relative w-full">
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
          </div>
        )} */}
    </header>
  );
}
