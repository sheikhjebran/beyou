import { AdminLayout } from '@/components/admin-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Here you would typically add authentication checks to protect this layout
  // For MVP, we assume the user is authenticated if they reach this layout.
  return <AdminLayout>{children}</AdminLayout>;
}
