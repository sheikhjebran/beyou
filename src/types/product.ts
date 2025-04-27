
export type Product = {
  id: string;
  name: string;
  type: 'Beauty' | 'Clothing'; // Keep this for broader classification if needed
  category: string; // Main category selection
  subCategory: string; // Sub-category selection
  description: string;
  price: number;
  imageUrl: string;
  quantity: number; // Added quantity field
  createdAt?: string | null; // Optional: Added for tracking creation time (as ISO string)
  updatedAt?: string | null; // Optional: Added for tracking last update time (as ISO string)
};

