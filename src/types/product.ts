
export type Product = {
  id: string;
  name: string;
  type: 'Beauty' | 'Clothing';
  description: string;
  price: number;
  imageUrl: string;
  quantity: number; // Added quantity field
  createdAt?: string | null; // Optional: Added for tracking creation time (as ISO string)
  updatedAt?: string | null; // Optional: Added for tracking last update time (as ISO string)
};
