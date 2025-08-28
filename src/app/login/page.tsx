import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Admin Login | BeYou',
  description: 'Login to BeYou Admin Panel',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container flex flex-col items-center justify-center min-h-screen -mt-16 px-4">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
