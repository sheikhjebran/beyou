
import type { Product } from '@/types/product';
import { ProductCard } from './product-card';

type ProductGridProps = {
  products: Product[]; // Receives the (potentially filtered) list of products
};

export function ProductGrid({ products }: ProductGridProps) {
  // No filtering needed here anymore, as it's done in the parent component (page.tsx)
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted to grid-cols-2 for mobile, reduced gap */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
