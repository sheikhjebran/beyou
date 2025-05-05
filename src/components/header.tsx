
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { LogIn, ShoppingCart, Search, Menu, ChevronDown } from 'lucide-react'; // Import Search icon, added Menu, ChevronDown
import { useCart } from '@/hooks/use-cart'; // Import the useCart hook
import { Badge } from '@/components/ui/badge'; // Import Badge
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Import Sheet components, including SheetHeader and SheetTitle
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Accordion
import { getMainCategories, getSubCategories } from '@/lib/categories'; // Import categories
import Image from 'next/image'; // Import Image
import { Separator } from '@/components/ui/separator'; // Import Separator

// Define props for the Header component
interface HeaderProps {
  onSearchChange?: (term: string) => void; // Optional callback for search input changes
}

// Helper function to create category/sub-category links
const createFilterLink = (category: string, subCategory?: string): string => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (subCategory) {
        params.set('subCategory', subCategory);
    }
    return `/products?${params.toString()}`;
};


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
      onSearchChange(term.toLowerCase()); // Convert search term to lowercase
    }
  };

  // Base Navigation Links Array (excluding categories dropdown)
  const baseNavLinks = [
    { href: "/", label: "Home" },
    // { href: "/#categories", label: "All Categories" }, // Link to categories section on home page (Replaced by dropdown)
    { href: "/products", label: "All Products" }, // Link to all products page
    // Category dropdown will be handled separately
    { href: "/contact", label: "Contact Us" },
  ];

  // Mobile Navigation Links (excluding categories handled by accordion)
   const mobileNavLinks = [
     baseNavLinks[0], // Home
     baseNavLinks[1], // All Products
     baseNavLinks[2] // Contact Us
   ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Adjusted height to h-24 for logo */}
      <div className="container flex h-24 items-center justify-between gap-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="outline" size="icon" suppressHydrationWarning>
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Open Menu</span>
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm overflow-y-auto p-0"> {/* Remove default padding */}
               <SheetHeader className="p-4 border-b"> {/* Add padding back to header */}
                  <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
               </SheetHeader>
               <nav className="flex flex-col space-y-1 p-4">
                 {/* Render basic links */}
                 {mobileNavLinks.map((link) => (
                    <SheetClose asChild key={link.href + link.label + '-mobile'}>
                       <Link
                         href={link.href}
                         className="block py-2 text-lg font-medium text-foreground transition-colors hover:text-primary"
                       >
                         {link.label}
                       </Link>
                    </SheetClose>
                  ))}

                 <Separator className="my-3" />

                 {/* Categories Accordion */}
                 <Accordion type="single" collapsible className="w-full">
                    <p className="text-lg font-medium text-foreground py-2">Categories</p>
                    {getMainCategories().map((category) => {
                       const subCategories = getSubCategories(category);
                       return (
                           <AccordionItem key={`mobile-cat-${category}`} value={category} className="border-b-0">
                             <AccordionTrigger className="text-base font-medium text-foreground/90 transition-colors hover:text-primary no-underline hover:no-underline py-2">
                               {category}
                             </AccordionTrigger>
                             <AccordionContent className="pl-4 pb-1"> {/* Indent sub-items */}
                               <div className="flex flex-col space-y-1">
                                 {['New Arrivals', 'Best Sellers'].includes(category) ? (
                                   <SheetClose asChild key={`mobile-${category}-link`}>
                                     <Link
                                       href="/coming-soon"
                                       className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                     >
                                       View {category}
                                     </Link>
                                   </SheetClose>
                                 ) : subCategories.length > 0 ? (
                                   <>
                                     {/* Link to the main category page */}
                                     <SheetClose asChild key={`mobile-${category}-all-link`}>
                                       <Link
                                         href={createFilterLink(category)}
                                         className="block py-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                                       >
                                         All {category}
                                       </Link>
                                     </SheetClose>
                                     <Separator className="my-1" />
                                     {/* Links to sub-categories */}
                                     {subCategories.map((subCategory) => (
                                       <SheetClose asChild key={`mobile-${subCategory}-link`}>
                                         <Link
                                           href={createFilterLink(category, subCategory)}
                                           className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                         >
                                           {subCategory}
                                         </Link>
                                       </SheetClose>
                                     ))}
                                   </>
                                 ) : (
                                    // Link to category page if no sub-categories (e.g., Photo Prints)
                                    <SheetClose asChild key={`mobile-${category}-direct-link`}>
                                      <Link
                                        href={createFilterLink(category)}
                                        className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                      >
                                        View {category}
                                      </Link>
                                    </SheetClose>
                                 )}
                               </div>
                             </AccordionContent>
                           </AccordionItem>
                       );
                    })}
                     {/* Link to view all products is now under baseNavLinks */}
                 </Accordion>

                  <Separator className="my-3" />

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
                         suppressHydrationWarning // Added to help with potential hydration issues
                       />
                     </div>
                  )}
               </nav>
             </SheetContent>
           </Sheet>
         </div>


        {/* Logo - Make sure BeYou.png exists in the /public directory */}
         <Link href="/" className="flex items-center mx-auto md:mx-0 md:mr-4 shrink-0">
            <Image
              src="/BeYou.png" // Path to logo in the public folder
              alt="BeYou Logo"
              width={150} // Original width for aspect ratio calculation
              height={60} // Original height for aspect ratio calculation
              priority // Load logo faster
              className="h-auto" // Maintain aspect ratio
              style={{ maxWidth: '150px', maxHeight: '60px', height: 'auto', width: 'auto' }} // Adjust max height/width, allow auto scaling
            />
         </Link>

        {/* Main Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 justify-center">
           {/* Render base links directly */}
           <Link
              key={baseNavLinks[0].href + baseNavLinks[0].label + '-desktop'}
              href={baseNavLinks[0].href}
              className="text-foreground transition-colors hover:text-primary"
            >
              {baseNavLinks[0].label}
           </Link>
            <Link
              key={baseNavLinks[1].href + baseNavLinks[1].label + '-desktop'}
              href={baseNavLinks[1].href}
              className="text-foreground transition-colors hover:text-primary"
            >
              {baseNavLinks[1].label}
            </Link>

           {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground transition-colors hover:text-primary px-0" suppressHydrationWarning>
                  Categories <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                 {/* Dynamically generate categories and sub-categories */}
                 {getMainCategories().map((category) => {
                    const subCategories = getSubCategories(category);
                    // Handle categories like 'New Arrivals', 'Best Sellers' directly
                    if (['New Arrivals', 'Best Sellers'].includes(category)) {
                        return (
                             <DropdownMenuItem key={category}>
                                <Link href="/coming-soon">{category}</Link>
                             </DropdownMenuItem>
                        );
                    // Handle categories with sub-categories
                    } else if (subCategories.length > 0) {
                         return (
                             <DropdownMenuSub key={category}>
                                 <DropdownMenuSubTrigger>
                                     {/* Link for the main category */}
                                     <Link href={createFilterLink(category)} className="flex-1">{category}</Link>
                                 </DropdownMenuSubTrigger>
                                 <DropdownMenuPortal>
                                     <DropdownMenuSubContent>
                                         {subCategories.map((subCategory) => (
                                             <DropdownMenuItem key={subCategory}>
                                                 {/* Link for the sub-category */}
                                                 <Link href={createFilterLink(category, subCategory)}>{subCategory}</Link>
                                             </DropdownMenuItem>
                                         ))}
                                         {/* Add link to main category page if subcategories exist */}
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem>
                                             <Link href={createFilterLink(category)}>All {category}</Link>
                                         </DropdownMenuItem>
                                     </DropdownMenuSubContent>
                                 </DropdownMenuPortal>
                             </DropdownMenuSub>
                         );
                    // Handle categories with NO sub-categories (like Photo Prints)
                    } else {
                        return (
                           <DropdownMenuItem key={category}>
                               <Link href={createFilterLink(category)}>{category}</Link>
                           </DropdownMenuItem>
                        );
                    }
                 })}

                 {/* <DropdownMenuSeparator />
                 <DropdownMenuItem><Link href="/products">View All Products</Link></DropdownMenuItem> */} {/* Covered by baseNavLinks */}

              </DropdownMenuContent>
            </DropdownMenu>

            {/* Render remaining base links */}
            <Link
               key={baseNavLinks[2].href + baseNavLinks[2].label + '-desktop'}
               href={baseNavLinks[2].href}
               className="text-foreground transition-colors hover:text-primary"
            >
              {baseNavLinks[2].label}
           </Link>
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
                suppressHydrationWarning // Added to help with potential hydration issues
              />
            </div>
          )}

           <Link href="/checkout" legacyBehavior passHref>
             <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative" suppressHydrationWarning>
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
             <Button variant="outline" size="sm" className="hidden sm:inline-flex" aria-label="Admin Login" suppressHydrationWarning>
               <LogIn className="mr-1.5 h-4 w-4" />
               Admin
             </Button>
           </Link>
            {/* Link for smaller screens */}
           <Link href="/login" passHref legacyBehavior>
             <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Admin Login" suppressHydrationWarning>
               <LogIn className="h-5 w-5" />
             </Button>
           </Link>
        </div>

      </div>
    </header>
  );
}
