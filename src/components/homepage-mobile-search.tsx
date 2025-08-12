
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function HomepageMobileSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      router.push(`/products?q=${encodeURIComponent(trimmedSearchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products on BeYou..."
        className="w-full rounded-lg bg-background pl-10 pr-4 h-11 text-base shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search products"
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  );
}
