
'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

interface LoadingImageProps extends ImageProps {
  containerClassName?: string;
  // loadingText prop is no longer used, but kept for API consistency if needed elsewhere
  loadingText?: string; 
  imgClassName?: string; 
}

export function LoadingImage({
  containerClassName,
  loadingText = "Loading...", // Default value, though not displayed directly
  alt,
  imgClassName,
  onLoadingComplete,
  onError,
  ...props
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadingComplete = (result: HTMLImageElement) => {
    setIsLoading(false);
    if (onLoadingComplete) {
      onLoadingComplete(result);
    }
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(event);
    }
  };

  const imageSrc = hasError ? (props.src.toString().includes('placehold.co') ? props.src : 'https://placehold.co/400x300.png?text=Error') : props.src;


  return (
    <div className={cn("relative w-full h-full bg-muted/10", containerClassName)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" /> {/* Replaced text with Loader2 icon */}
        </div>
      )}
      <Image
        alt={alt}
        className={cn(
          imgClassName, 
          isLoading || hasError ? 'opacity-25' : 'opacity-100', 
          'transition-opacity duration-300 ease-in-out'
        )}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        src={imageSrc} 
        {...props}
      />
      {hasError && !props.src.toString().includes('placehold.co') && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-destructive/10 text-destructive text-xs font-medium p-2 text-center">
          <span>Image failed to load.</span>
        </div>
      )}
    </div>
  );
}
