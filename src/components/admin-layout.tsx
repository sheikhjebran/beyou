
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { LayoutDashboard, Package, LogOut, Home, Instagram, Youtube, UserCircle, DollarSign, Palette } from 'lucide-react'; // Added Palette
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/auth-context';
import { signOutUser } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => pathname === path || (path.endsWith('/') ? pathname === path.slice(0, -1) : pathname === path + '/');


  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };

  const userEmailInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A';

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center h-20 px-2">
             <Link href="/admin" className="group-data-[collapsible=icon]:hidden text-xl font-bold text-primary">
                BeYou Admin
             </Link>
             <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" suppressHydrationWarning/>
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
                  suppressHydrationWarning
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
                  isActive={pathname.startsWith('/admin/inventory')}
                  aria-label="Inventory"
                  suppressHydrationWarning
                >
                  <Package />
                  <span>Inventory</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/sales" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={{ children: "Sales", side: "right" }}
                  isActive={isActive('/admin/sales')}
                  aria-label="Sales"
                  suppressHydrationWarning
                >
                  <DollarSign />
                  <span>Sales</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/customize" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={{ children: "Customize", side: "right" }}
                  isActive={isActive('/admin/customize')}
                  aria-label="Customize"
                  suppressHydrationWarning
                >
                  <Palette />
                  <span>Customize</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/profile" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip={{ children: "Profile", side: "right" }}
                  isActive={isActive('/admin/profile')}
                  aria-label="Profile"
                  suppressHydrationWarning
                >
                  <UserCircle />
                  <span>Profile</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
             <SidebarMenuItem>
                <Link href="/" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip={{ children: "Back to Shop", side: "right" }}
                     aria-label="Back to Shop"
                     suppressHydrationWarning
                   >
                    <Home />
                     <span className="group-data-[collapsible=icon]:hidden">Back to Shop</span>
                   </SidebarMenuButton>
                 </Link>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                   tooltip={{ children: "Logout", side: "right" }}
                   aria-label="Logout"
                   onClick={handleLogout}
                   className="text-destructive hover:bg-destructive/10"
                   suppressHydrationWarning
                 >
                   <LogOut />
                   <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                 </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex items-center p-2 gap-2 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                    {currentUser?.photoURL ? (
                        <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || currentUser.email || 'User Avatar'} />
                    ) : null}
                    <AvatarFallback>{userEmailInitial}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden truncate max-w-[100px]" title={currentUser?.displayName || currentUser?.email || 'Admin'}>
                    {currentUser?.displayName || currentUser?.email || 'Admin User'}
                  </span>
                </div>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <div className="flex-1 p-4 md:p-6">
           {children}
         </div>
          <footer className="py-4 px-4 md:px-6 text-center text-xs text-muted-foreground border-t mt-8 bg-background">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
                <span>© {new Date().getFullYear()} BeYou Admin Panel. | Developer: <a href="mailto:sheikhjebran@gmail.com" className="hover:text-primary transition-colors">sheikhjebran@gmail.com</a></span>
                <div className="flex space-x-3 mt-2 sm:mt-0">
                    <a href="https://www.instagram.com/ayeshaaa.forlife?igsh=dzdoMWZhcTZicXZp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        <Instagram className="h-5 w-5" />
                    </a>
                    <a href="https://youtube.com/@beyoubyayeshaa?si=enC0JxhOQ1vSL5IW" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        <Youtube className="h-5 w-5" />
                    </a>
                </div>
            </div>
          </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
