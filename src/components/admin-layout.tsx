'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { LayoutDashboard, Package, LogOut, Home, Instagram, Youtube, UserCircle, DollarSign, Palette } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/auth-context';
import { useLogout } from '@/hooks/use-logout';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const handleLogout = useLogout();

  const isActive = (path: string) => pathname === path || (path.endsWith('/') ? pathname === path.slice(0, -1) : pathname === path + '/');

  const userEmailInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A';

  return (
    <div className="flex min-h-screen">
      <SidebarProvider defaultOpen>
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center h-20 px-2">
              <Link href="/admin" className="group-data-[collapsible=icon]:hidden text-xl font-bold text-primary">
                BeYou Admin
              </Link>
              <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" suppressHydrationWarning/>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col h-[calc(100vh-5rem)]">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Dashboard", side: "right" }}
                  isActive={isActive('/admin')}
                  aria-label="Dashboard"
                  suppressHydrationWarning
                >
                  <Link href="/admin">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Inventory", side: "right" }}
                  isActive={isActive('/admin/inventory')}
                  aria-label="Inventory"
                  suppressHydrationWarning
                >
                  <Link href="/admin/inventory">
                    <Package />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Sales", side: "right" }}
                  isActive={isActive('/admin/sales')}
                  aria-label="Sales"
                  suppressHydrationWarning
                >
                  <Link href="/admin/sales">
                    <DollarSign />
                    <span>Sales</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Customize", side: "right" }}
                  isActive={isActive('/admin/customize')}
                  aria-label="Customize"
                  suppressHydrationWarning
                >
                  <Link href="/admin/customize">
                    <Palette />
                    <span>Customize</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Profile", side: "right" }}
                  isActive={isActive('/admin/profile')}
                  aria-label="Profile"
                  suppressHydrationWarning
                >
                  <Link href="/admin/profile">
                    <UserCircle />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-auto">
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: "Logout", side: "right" }}
                  aria-label="Logout"
                  suppressHydrationWarning
                  onClick={handleLogout}
                >
                  <button className="w-full">
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
