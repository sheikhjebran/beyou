
import { Header } from '@/components/header';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-6 text-center">
        <PackageSearch className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">Coming Soon!</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          We're working hard to bring you exciting new products and features. Stay tuned!
        </p>
        <Link href="/" passHref legacyBehavior>
          <Button>Back to Home</Button>
        </Link>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}

    