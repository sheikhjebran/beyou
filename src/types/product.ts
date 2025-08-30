

export type Product = {
  id: string;               // varchar(36)
  name: string;            // varchar(255)
  description: string | null;     // text, nullable
  price: number;           // decimal(10,2)
  stock_quantity: number;  // int(11), default 0
  category: string;        // varchar(100)
  subcategory: string | null;    // varchar(100), nullable
  primary_image_path: string | null;  // varchar(255), nullable
  is_best_seller: boolean;      // tinyint(1), default 0
  created_at: string;     // timestamp
  updated_at: string;     // timestamp
  // Virtual fields (not in DB but computed)
  image_paths?: string[];   // Computed from product_images table
};
