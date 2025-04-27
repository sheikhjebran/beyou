import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  // In a real app, this page should be protected and require authentication.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
       <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
             <LayoutDashboard className="h-6 w-6 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome, Admin! Manage your store from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            This is the admin dashboard. Functionality to manage products will be added here in the future.
          </p>
          <Link href="/" legacyBehavior passHref>
            <Button variant="outline">Go back to Shop</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
