import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
    fallbackSrc?: string;
}

export function SafeImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    fallbackSrc = '/images/placeholder.png'
}: SafeImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle loading complete
    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    // Handle error
    const handleError = () => {
        console.warn(`Failed to load image: ${src}`);
        setError(true);
        setIsLoading(false);
    };

    // Use fallback if there's an error
    const imageSrc = error ? fallbackSrc : src;

    return (
        <div className={`relative ${className}`} style={{ minHeight: '10px' }}>
            <Image
                src={imageSrc}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                onError={handleError}
                onLoadingComplete={handleLoadingComplete}
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.2s ease-in-out'
                }}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
        </div>
    );
}