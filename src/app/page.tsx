

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Tag, PackageSearch, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { getMainCategories as getAllMainCategories } from '@/lib/categories';
import HomepageBanners from '@/components/homepage-banners';
import BestSellingProducts from '@/components/best-selling-products';
import CategoriesGrid from '@/components/categories-grid';
import LoadingImage from '@/components/loading-image';
import { ProductCard } from '@/components/product-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HomepageMobileSearch } from '@/components/homepage-mobile-search';


interface SliderImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  dataAiHint?: string;
  priority?: boolean;
}

interface CategoryWithImage {
  name: string;
  customImageUrl?: string | null;
}

export default function Home() {
  const mainCategories = getAllMainCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto">
        <section className="px-4 pt-4 md:hidden">
          <HomepageMobileSearch />
        </section>

        <section className="relative my-6 md:my-8 h-[250px] sm:h-[400px] md:h-[500px] lg:h-[550px]">
          <HomepageBanners />
        </section>

        {/* Best Sellers Section */}
        <section id="best-sellers" className="py-4 md:py-6">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-center text-foreground flex items-center justify-center gap-2">
                <Star className="text-primary" /> Best Selling Products
            </h2>
            <div className="max-w-full overflow-hidden">
              <BestSellingProducts />
            </div>
        </section>
        
        <Separator className="my-8" />

        <section id="categories" className="p-4 md:p-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-center text-foreground">Explore Our Categories</h2>
          <CategoriesGrid categories={mainCategories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
