import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
          BeYou
        </Link>
        <nav>
          <Link href="/login" legacyBehavior passHref>
             <Button variant="outline" aria-label="Admin Login">
               <LogIn className="mr-2 h-4 w-4" />
               Admin Login
             </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
