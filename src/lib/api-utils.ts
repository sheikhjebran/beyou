export function getApiUrl(path: string): string {
  // For server-side requests
  if (typeof window === 'undefined') {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
    return `${protocol}://${host}${path}`;
  }
  
  // For client-side requests, use relative path
  return path;
}
