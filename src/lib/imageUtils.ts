// Function to convert relative image paths to full URLs
export function getImageUrl(path: string): string {
  if (!path) return '/images/placeholder.png';
  
  // If it's already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a relative path starting with /, use it as is
  if (path.startsWith('/')) {
    return path;
  }

  // Otherwise, assume it's a relative path and prepend /uploads/
  return `/uploads/${path.startsWith('products/') ? path : `products/${path}`}`;
}
