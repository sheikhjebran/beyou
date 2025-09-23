
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingImage from './loading-image'; // Import LoadingImage

interface SliderImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  dataAiHint?: string;
  priority?: boolean;
}

interface ImageSliderProps {
  images: SliderImage[];
  interval?: number;
  className?: string;
  autoPlay?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  interval = 5000,
  className,
  autoPlay = true,
  showDots = true,
  showArrows = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, images.length, interval, goToNext]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-muted flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No banners to display. Please add banners in the admin panel.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-lg shadow-lg", className)}>
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <LoadingImage
              src={image.src}
              alt={image.alt}
              fill
              imgClassName="object-cover"
              priority={image.priority || index === 0}
              data-ai-hint={image.dataAiHint || 'banner image'}
              sizes="100vw" // Simplified for full-width hero elements
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
            
            {(image.title || image.subtitle) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 md:p-8 pointer-events-none z-10">
                {image.title && <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg leading-tight">{image.title}</h2>}
                {image.subtitle && <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-md max-w-xl mx-auto">{image.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out",
                currentIndex === index ? "bg-primary scale-125" : "bg-muted-foreground/70 hover:bg-muted-foreground"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
