'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Loader2, ImageOff } from 'lucide-react'
import { useState } from 'react'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  className?: string
  containerClassName?: string
  imgClassName?: string
  'data-ai-hint'?: string
}

export function LoadingImage(props: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative w-full h-full bg-muted/10', props.containerClassName)}>
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 text-muted-foreground">
          <ImageOff className="h-8 w-8 mb-2" />
          <p className="text-sm">Failed to load image</p>
        </div>
      ) : (
        <Image
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
          priority={props.priority}
          quality={props.quality}
          fill={props.fill}
          sizes={props.sizes}
          className={cn(
            props.className,
            props.imgClassName,
            loading ? 'opacity-25' : 'opacity-100',
            'transition-opacity duration-200'
          )}
          data-ai-hint={props['data-ai-hint']}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
        />
      )}
    </div>
  )
}

export default LoadingImage