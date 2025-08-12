
'use client';

import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator'; // For visual separation

export function Footer() {
  return (
    <footer className="py-8 text-sm text-muted-foreground border-t mt-12 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">BeYou</h3>
            <p className="text-xs">
              Your one-stop shop for affordable kawaii cosmetics, press-on nails, aesthetic custom prints and more. All made to turn heads and melt hearts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Customer Service</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/exchange-refund-policy" className="hover:text-primary transition-colors">Exchange & Refund Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ayeshaaa.forlife?igsh=dzdoMWZhcTZicXZp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://youtube.com/@beyoubyayeshaa?si=enC0JxhOQ1vSL5IW" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="text-center text-xs">
          <span>© {new Date().getFullYear()} BeYou. All rights reserved. | Developer: <a href="mailto:sheikhjebran@gmail.com" className="hover:text-primary transition-colors">sheikhjebran@gmail.com</a></span>
        </div>
      </div>
    </footer>
  );
}
