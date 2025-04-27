
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header'; // Import Header

export default function LoginPage() {
  const [loginCode, setLoginCode] = useState(''); // Changed state variable name
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic Authentication Check (Insecure - for MVP only)
    if (loginCode === 'ayesha') { // Check against the login code
      // In a real app, you'd set a session/token here
      console.log('Admin Login Successful'); // Placeholder
      router.push('/admin'); // Redirect to a future admin dashboard
    } else {
      setError('Invalid login code. Please try again.'); // Updated error message
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
       <Header /> {/* Add Header */}
       <main className="flex flex-1 items-center justify-center bg-secondary p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
              <CardDescription>Enter your code to access the admin area.</CardDescription> {/* Updated description */}
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginCode">Admin Login code</Label> {/* Changed label text and htmlFor */}
                  <Input
                    id="loginCode" // Changed input id
                    type="password" // Changed input type to password
                    placeholder="enter password" // Changed placeholder text
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    required
                    aria-describedby={error ? "error-message" : undefined}
                    aria-invalid={!!error}
                  />
                  {error && <p id="error-message" className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" suppressHydrationWarning>
                  Login
                </Button>
              </form>
               <div className="mt-4 text-center text-sm">
                 <Link href="/" className="underline text-muted-foreground hover:text-primary">
                   Back to Shop
                 </Link>
              </div>
            </CardContent>
          </Card>
       </main>
        {/* Optional Footer */}
         <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12 bg-background">
            © {new Date().getFullYear()} BeYou. All rights reserved.
          </footer>
    </div>
  );
}

