import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for a clean look
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Elegance Boutique - Beauty & Clothing', // Updated title
  description: 'Discover curated beauty products and stylish clothing at Elegance Boutique.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning for potential dark mode issues */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
