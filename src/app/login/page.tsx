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

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic Authentication Check (Insecure - for MVP only)
    if (username === 'ayesha') {
      // In a real app, you'd set a session/token here
      console.log('Admin Login Successful'); // Placeholder
      router.push('/admin'); // Redirect to a future admin dashboard
    } else {
      setError('Invalid username. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription>Enter your username to access the admin area.</CardDescription>
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={!!error}
              />
              {error && <p id="error-message" className="text-sm text-destructive">{error}</p>}
            </div>
            {/* Password field removed as per requirement */}
            <Button type="submit" className="w-full">
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
    </div>
  );
}
