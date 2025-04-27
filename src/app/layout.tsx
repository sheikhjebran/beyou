
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for a clean look
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { CartProvider } from '@/context/cart-context'; // Import CartProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'BeYou - Beauty & Clothing', // Updated title
  description: 'Discover curated beauty products and stylish clothing at BeYou.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning on html is often for theme switching (light/dark)
    <html lang="en" suppressHydrationWarning>
      {/* Add suppressHydrationWarning to body to help with browser extension issues like Grammarly adding attributes */}
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
