

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, ShoppingCart, Search, Menu, ChevronDown, Instagram, Youtube } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
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
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getMainCategories, getSubCategories, type Category } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface HeaderProps {}

const createFilterLink = (category: string, subCategory?: string): string => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (subCategory) {
        params.set('subCategory', subCategory);
    }
    return `/products?${params.toString()}`;
};


export function Header({}: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isClientMounted, setIsClientMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClientMounted(true);
  }, []);


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSearchTerm = localSearchTerm.trim();
    if (trimmedSearchTerm) {
      router.push(`/products?q=${encodeURIComponent(trimmedSearchTerm)}`);
      // For mobile sheet
      const sheetCloseButton = document.querySelector('#mobile-menu-close-button') as HTMLElement;
      if (sheetCloseButton) {
        sheetCloseButton.click();
      }
    }
  };


  const baseNavLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Products" },
    { href: "/contact", label: "Contact Us" },
  ];

   const mobileNavLinks = [
     baseNavLinks[0],
     baseNavLinks[1],
     baseNavLinks[2]
   ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 lg:px-8 flex h-24 items-center justify-between gap-4">
        <div className="md:hidden">
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="outline" size="icon" suppressHydrationWarning>
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Open Menu</span>
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm overflow-y-auto p-0">
               <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
                  <SheetClose asChild>
                    <button id="mobile-menu-close-button" className="hidden">Close</button>
                  </SheetClose>
               </SheetHeader>
               <nav className="flex flex-col space-y-1 p-4">
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
                 <Accordion type="single" collapsible className="w-full">
                    <p className="text-lg font-medium text-foreground py-2">Categories</p>
                    {getMainCategories().map((category) => {
                       const subCategories = getSubCategories(category);
                       return (
                           <AccordionItem key={`mobile-cat-${category}`} value={category} className="border-b-0">
                             <AccordionTrigger className="text-base font-medium text-foreground/90 transition-colors hover:text-primary no-underline hover:no-underline py-2">
                               {category}
                             </AccordionTrigger>
                             <AccordionContent className="pl-4 pb-1">
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
                                     <SheetClose asChild key={`mobile-${category}-all-link`}>
                                       <Link
                                         href={createFilterLink(category)}
                                         className="block py-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                                       >
                                         All {category}
                                       </Link>
                                     </SheetClose>
                                     <Separator className="my-1" />
                                     {subCategories.map((subCategoryItem) => (
                                       <SheetClose asChild key={`mobile-${subCategoryItem}-link`}>
                                         <Link
                                           href={createFilterLink(category, subCategoryItem)}
                                           className="block py-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                         >
                                           {subCategoryItem}
                                         </Link>
                                       </SheetClose>
                                     ))}
                                   </>
                                 ) : (
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
                 </Accordion>
                 <Separator className="my-3" />
                 <SheetClose asChild>
                    <Link href="/login" className="flex items-center py-2 text-lg font-medium text-foreground transition-colors hover:text-primary">
                        <LogIn className="mr-2 h-5 w-5" /> Admin Login
                    </Link>
                 </SheetClose>
               </nav>
             </SheetContent>
           </Sheet>
         </div>

        <Link href="/" className="flex items-center mx-auto md:mx-0 md:mr-4 shrink-0" aria-label="BeYou Homepage">
            <Image
                src="/icons/BeYou.png" 
                alt="BeYou Logo"
                width={130}
                height={60}
                className="w-auto h-[60px] object-contain"
                priority={true}
                fetchPriority="high"
                loading="eager"
            />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 justify-center">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground transition-colors hover:text-primary px-0" suppressHydrationWarning>
                  Categories <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                 {getMainCategories().map((category) => {
                    const subCategories = getSubCategories(category);
                    if (['New Arrivals', 'Best Sellers'].includes(category)) {
                        return (
                             <DropdownMenuItem key={category}>
                                <Link href="/coming-soon">{category}</Link>
                             </DropdownMenuItem>
                        );
                    } else if (subCategories.length > 0) {
                         return (
                             <DropdownMenuSub key={category}>
                                 <DropdownMenuSubTrigger>
                                     <Link href={createFilterLink(category)} className="flex-1">{category}</Link>
                                 </DropdownMenuSubTrigger>
                                 <DropdownMenuPortal>
                                     <DropdownMenuSubContent>
                                         {subCategories.map((subCategoryItem) => (
                                             <DropdownMenuItem key={subCategoryItem}>
                                                 <Link href={createFilterLink(category, subCategoryItem)}>{subCategoryItem}</Link>
                                             </DropdownMenuItem>
                                         ))}
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem>
                                             <Link href={createFilterLink(category)}>All {category}</Link>
                                         </DropdownMenuItem>
                                     </DropdownMenuSubContent>
                                 </DropdownMenuPortal>
                             </DropdownMenuSub>
                         );
                    } else {
                        return (
                           <DropdownMenuItem key={category}>
                               <Link href={createFilterLink(category)}>{category}</Link>
                           </DropdownMenuItem>
                        );
                    }
                 })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
               key={baseNavLinks[2].href + baseNavLinks[2].label + '-desktop'}
               href={baseNavLinks[2].href}
               className="text-foreground transition-colors hover:text-primary"
            >
              {baseNavLinks[2].label}
           </Link>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          
           <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg bg-background pl-8 h-9"
                value={localSearchTerm}
                onChange={handleSearchInputChange}
                aria-label="Search products"
                suppressHydrationWarning
              />
              <button type="submit" className="hidden">Search</button>
            </form>
          
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              asChild
            >
              <Link href="/checkout" aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
                {isClientMounted && totalItems > 0 && (
                 <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                 >
                    {totalItems}
                 </Badge>
               )}
              </Link>
            </Button>           <Button variant="outline" size="sm" className="sm:inline-flex" asChild>
             <Link href="/login" aria-label="Admin Login">
               <LogIn className="mr-1.5 h-4 w-4" />
               Admin
             </Link>
           </Button>
        </div>
      </div>
    </header>
  );
}
