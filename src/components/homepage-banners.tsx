'use client';

import { useEffect, useState } from 'react';
import ImageSlider from '@/components/image-slider';
import { getBanners } from '@/services/bannerService';
import type { Banner } from '@/types/banner';

interface SliderImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  dataAiHint?: string;
  priority?: boolean;
}

export default function HomepageBanners() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([{
    src: '/coming-soon.png',
    alt: 'Loading...',
    title: 'Loading...',
    subtitle: 'Please wait...',
    dataAiHint: 'loading state',
    priority: true,
  }]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const fetchedBanners = await getBanners();
        if (fetchedBanners.length > 0) {
          const dynamicBanners = fetchedBanners.map((banner, index) => ({
            src: banner.imageUrl,
            alt: banner.title || 'Homepage banner image',
            title: banner.title,
            subtitle: banner.subtitle,
            dataAiHint: 'homepage banner visual',
            priority: index === 0,
          }));
          setSliderImages(dynamicBanners);
        } else {
          setSliderImages([{
            src: '/coming-soon.png',
            alt: 'Default banner',
            title: 'Welcome to BeYou',
            subtitle: 'Explore our latest collections.',
            dataAiHint: 'storefront welcome',
            priority: true,
          }]);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        setError('Failed to load banners. Please try again later.');
        setSliderImages([{
          src: 'https://placehold.co/1200x500.png',
          alt: 'Error loading banner',
          title: 'Banners Unavailable',
          subtitle: 'Please check back later.',
          dataAiHint: 'error state',
          priority: true,
        }]);
      }
    }

    fetchBanners();
  }, []);

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return <ImageSlider images={sliderImages} />;
}
