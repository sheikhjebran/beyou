

export type Product = {
  id: string;
  name: string;
  category: string; // Main category selection
  subCategory: string; // Sub-category selection
  description: string;
  price: number;
  primaryImageUrl: string; // New: Main image for display
  imageUrls: string[]; // New: Array of all image URLs, first one can be primary
  quantity: number; // Added quantity field
  isBestSeller: boolean; // Changed from optional to required
  createdAt?: string | null; // Optional: Added for tracking creation time (as ISO string)
  updatedAt?: string | null; // Optional: Added for tracking last update time (as ISO string)
};
