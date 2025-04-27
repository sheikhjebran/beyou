import { ProductGrid } from '@/components/product-grid';
import { mockProducts } from '@/lib/mock-data';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6 container mx-auto">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-center">Our Products</h1>
        <ProductGrid products={mockProducts} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} Elegance Boutique. All rights reserved.
      </footer>
    </div>
  );
}
