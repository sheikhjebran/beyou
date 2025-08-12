
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AdminLayout as AdminLayoutComponent } from '@/components/admin-layout';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Admin Area...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="ml-4 text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
