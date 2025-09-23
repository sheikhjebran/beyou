const DEFAULT_REVALIDATE_TIME = 60; // 1 minute
const DEFAULT_STALE_TIME = 300; // 5 minutes

export const getCacheHeaders = (options?: {
    revalidate?: number;
    staleWhileRevalidate?: number;
}) => {
    const revalidate = options?.revalidate ?? DEFAULT_REVALIDATE_TIME;
    const stale = options?.staleWhileRevalidate ?? DEFAULT_STALE_TIME;

    return {
        'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${stale}`,
        'CDN-Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${stale}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${stale}`,
    };
};

export const getStaticCacheHeaders = () => getCacheHeaders({
    revalidate: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
});

export const getDynamicCacheHeaders = () => getCacheHeaders({
    revalidate: 30, // 30 seconds
    staleWhileRevalidate: 60, // 1 minute
});

export const getNoCacheHeaders = () => ({
    'Cache-Control': 'no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
});
