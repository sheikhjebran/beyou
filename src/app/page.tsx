

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Tag, PackageSearch, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { getMainCategories as getAllMainCategories } from '@/lib/categories';
import ImageSlider from '@/components/image-slider';
import { getBanners, type Banner } from '@/services/bannerService';
import { getBestSellingProducts } from '@/services/productService';
import { getCategoryImage, type CategoryImageData } from '@/services/categoryImageService';
import { LoadingImage } from '@/components/loading-image';
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

async function getHomepageData() {
  const bannersPromise = getBanners();
  const bestSellingProductsPromise = getBestSellingProducts();
  const mainCategories = getAllMainCategories();

  const categoriesDataPromises = mainCategories.map(async (catName) => {
    const imageData: CategoryImageData | null = await getCategoryImage(catName);
    return {
      name: catName,
      customImageUrl: imageData?.imageUrl || null,
    };
  });

  try {
    const [fetchedBanners, bestSellingProducts, resolvedCategoriesData] = await Promise.all([
      bannersPromise,
      bestSellingProductsPromise,
      Promise.all(categoriesDataPromises)
    ]);

    // Process Banners
    let dynamicBanners: SliderImage[];
    if (fetchedBanners.length > 0) {
      dynamicBanners = fetchedBanners.map((banner, index) => ({
        src: banner.imageUrl,
        alt: banner.title || 'Homepage banner image',
        title: banner.title,
        subtitle: banner.subtitle,
        dataAiHint: 'homepage banner visual',
        priority: index === 0,
      }));
    } else {
      dynamicBanners = [{
        src: 'https://placehold.co/1200x500.png',
        alt: 'Default banner',
        title: 'Welcome to BeYou',
        subtitle: 'Explore our latest collections.',
        dataAiHint: 'storefront welcome',
        priority: true,
      }];
    }

    return {
      dynamicBanners,
      bestSellingProducts,
      categoriesWithImages: resolvedCategoriesData,
      bannerError: null,
      productError: null,
      categoryFetchError: null,
    };

  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    
    // Return a default state on error so the page can still render
    return {
      dynamicBanners: [{
        src: 'https://placehold.co/1200x500.png',
        alt: 'Error loading banner',
        title: 'Banners Unavailable',
        subtitle: 'Please check back later.',
        dataAiHint: 'placeholder error',
        priority: true,
      }],
      bestSellingProducts: [],
      categoriesWithImages: getAllMainCategories().map(name => ({ name, customImageUrl: null })),
      bannerError: errorMessage,
      productError: errorMessage,
      categoryFetchError: errorMessage,
    };
  }
}


export default async function Home() {
  const { 
    dynamicBanners, 
    bestSellingProducts, 
    categoriesWithImages, 
    bannerError, 
    productError, 
    categoryFetchError 
  } = await getHomepageData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto">
        <section className="px-4 pt-4 md:hidden">
          <HomepageMobileSearch />
        </section>

        <section className="relative my-6 md:my-8 h-[250px] sm:h-[400px] md:h-[500px] lg:h-[550px]">
          {bannerError ? (
            <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-4">
              <AlertCircle className="h-6 w-6 mb-2" />
              <AlertTitle>Failed to load banners</AlertTitle>
              <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          ) : (
            <ImageSlider images={dynamicBanners} className="w-full h-full" />
          )}
        </section>

        {/* Best Sellers Section */}
        <section id="best-sellers" className="py-4 md:py-6">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-center text-foreground flex items-center justify-center gap-2">
                <Star className="text-primary" /> Best Selling Products
            </h2>
            {productError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Products</AlertTitle>
                    <AlertDescription>{productError}</AlertDescription>
                </Alert>
            ) : bestSellingProducts.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                  <div className="flex w-max space-x-4 p-4">
                    {bestSellingProducts.map((product) => (
                      <div key={product.id} className="w-60 sm:w-64 shrink-0">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                 <p className="text-center text-muted-foreground">No best sellers featured right now. Check back soon!</p>
            )}
        </section>
        
        <Separator className="my-8" />

        <section id="categories" className="p-4 md:p-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tight text-center text-foreground">Explore Our Categories</h2>
          {categoryFetchError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Categories</AlertTitle>
              <AlertDescription>{categoryFetchError}</AlertDescription>
            </Alert>
          ) : categoriesWithImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categoriesWithImages.map((category) => (
                <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`} passHref legacyBehavior>
                  <a className="group block">
                    <Card className="w-full overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                      <CardHeader className="p-0">
                        <div className="relative aspect-[4/3] w-full">
                          {category.customImageUrl ? (
                            <LoadingImage
                              src={category.customImageUrl}
                              alt={`${category.name} category items display`}
                              fill
                              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 22vw"
                              imgClassName="object-cover transition-opacity duration-300 group-hover:opacity-90"
                              data-ai-hint={`${category.name.toLowerCase().replace(/\s+/g, ' ').split(' ').slice(0,2).join(' ')} product display`}
                              loadingText="Loading..."
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-muted/30">
                              <PackageSearch className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-sm font-medium text-muted-foreground">Image Coming Soon</p>
                              <p className="text-xs text-muted-foreground/80">{category.name}</p>
                            </div>
                          )}
                          {category.customImageUrl && (
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-primary shrink-0" />
                          <CardTitle className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {category.name}
                          </CardTitle>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No categories to display at the moment.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
