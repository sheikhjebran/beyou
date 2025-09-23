'use client';

import { useEffect, useState } from 'react';
import { getCategoryImage } from '@/services/categoryImageService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PackageSearch, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import LoadingImage from '@/components/loading-image';

interface Category {
  name: string;
  customImageUrl: string | null;
}

interface CategoriesGridProps {
  categories: string[];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  const [categoriesWithImages, setCategoriesWithImages] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryImages() {
      try {
        const categoriesData = await Promise.all(
          categories.map(async (name) => {
            const imageData = await getCategoryImage(name);
            return {
              name,
              customImageUrl: imageData?.imageUrl || null,
            };
          })
        );
        setCategoriesWithImages(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch category images:', err);
        setError('Failed to load category images. Please try again later.');
        setLoading(false);
      }
    }

    fetchCategoryImages();
  }, [categories]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="w-full h-48 animate-pulse bg-muted/50">
            <div className="h-full flex items-center justify-center">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Categories</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (categoriesWithImages.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No categories to display at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categoriesWithImages.map((category) => (
        <Link 
          key={category.name} 
          href={`/products?category=${encodeURIComponent(category.name)}`}
          className="group block"
        >
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
        </Link>
      ))}
    </div>
  );
}
