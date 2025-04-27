export type Product = {
  id: string;
  name: string;
  type: 'Beauty' | 'Clothing';
  description: string;
  price: number;
  imageUrl: string;
  quantity: number; // Added quantity field
};
