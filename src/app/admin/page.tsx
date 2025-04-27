// No longer needs 'use client' if not using client-side hooks/state directly here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
  // This content will be rendered inside the AdminLayout's SidebarInset area
  return (
    <div className="flex flex-1 flex-col items-center justify-start p-4 md:p-6">
      <Card className="w-full max-w-4xl text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription className="text-lg">Welcome, Admin!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Use the sidebar navigation to manage your store's inventory and other settings.
          </p>
          {/* Add more dashboard widgets or summaries here */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-xl">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Total Products: [Data Placeholder]</p>
                    <p>Orders Today: [Data Placeholder]</p>
                </CardContent>
             </Card>
              <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Product 'X' added.</p>
                    <p>Order #123 processed.</p>
                </CardContent>
             </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
