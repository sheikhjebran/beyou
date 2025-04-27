
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // Get router instance

  // Basic check for active route (can be refined)
  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    // Simple logout: redirect to home page.
    // In a real app, this would involve clearing session/token.
    router.push('/');
  };


  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
             <Link href="/" className="font-bold text-lg text-primary group-data-[collapsible=icon]:hidden">
               BeYou Admin
             </Link>
             <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={{ children: "Dashboard", side: "right" }}
                  isActive={isActive('/admin')}
                  aria-label="Dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/inventory" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={{ children: "Inventory", side: "right" }}
                  isActive={isActive('/admin/inventory')}
                  aria-label="Inventory"
                >
                  <Package />
                  <span>Inventory</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {/* Add more admin links here */}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
             <SidebarMenuItem>
                <Link href="/" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip={{ children: "Back to Shop", side: "right" }}
                     aria-label="Back to Shop"
                   >
                    <Home />
                     <span className="group-data-[collapsible=icon]:hidden">Back to Shop</span>
                   </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
             <SidebarMenuItem>
                {/* Implement actual logout logic here */}
                <SidebarMenuButton
                   tooltip={{ children: "Logout", side: "right" }}
                   aria-label="Logout"
                   onClick={handleLogout} // Use handleLogout function
                   className="text-destructive hover:bg-destructive/10"
                 >
                   <LogOut />
                   <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                 </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex items-center p-2 gap-2 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                    <AvatarImage src="https://picsum.photos/seed/admin/40/40" alt="Admin Avatar" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Admin User</span>
                </div>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         {/* Main content area */}
         <div className="flex-1 p-4 md:p-6">
           {children}
         </div>
          {/* Optional Footer within inset */}
          <footer className="py-4 px-4 md:px-6 text-center text-xs text-muted-foreground border-t mt-8 bg-background">
             © {new Date().getFullYear()} BeYou Admin Panel.
          </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
