
import React, { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getProductById } from '@/services/server/productServerService';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetailsClient } from '@/components/product-details-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

// Server-side function to generate metadata for SEO
export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const productId = String(resolvedParams?.productId);
    const product = await getProductById(productId);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    return {
      title: `${product.name} - ${product.category}`,
      description: `Shop for ${product.name}. ${product.description?.substring(0, 150) || 'No description available'}...`,
      openGraph: {
        title: `${product.name} | BeYou`,
        description: product.description?.substring(0, 150) || 'No description available',
        images: [
          {
            url: product.primary_image_path || '/images/placeholder.png',
            width: 600,
            height: 600,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the product.',
    };
  }
}

// Loading component for Suspense boundary
function ProductDetailsLoading() {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex justify-center items-center gap-2 mt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-md" />
          <Skeleton className="h-16 w-16 rounded-md" />
          <Skeleton className="h-16 w-16 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" /> <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" /> <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2"> <Skeleton className="h-5 w-20" /> <Skeleton className="h-10 w-32" /> </div>
        <div className="space-y-2"> <Skeleton className="h-5 w-20" /> <Skeleton className="h-20 w-full" /> </div>
        <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full mt-3" />
      </div>
    </div>
  );
}

// The main server component for the product detail page
export default async function ProductDetailPage({ params }: ProductPageProps) {
  try {
    const resolvedParams = await params;
    const productId = String(resolvedParams?.productId);

    if (!productId) {
      notFound();
    }
    
    // Fetch data on the server
    const product = await getProductById(productId);

    if (!product) {
      notFound();
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>
          </Button>
        </div>
        <Card className="shadow-lg overflow-hidden">
          <Suspense fallback={<ProductDetailsLoading />}>
            <ProductDetailsClient product={product} />
          </Suspense>
        </Card>
      </main>
      <Footer />
    </div>
  );
  } catch (error) {
    console.error('Error loading product:', error);
    throw error; // Let Next.js error boundary handle it
  }
}
