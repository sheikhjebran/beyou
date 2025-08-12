
"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Instagram, Youtube, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { signUpWithEmailPassword } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
// No specific 'Metadata' type import needed for client-side title update

const signupFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], 
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Create Admin Account | BeYou";
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmailPassword(data.email, data.password);
      toast({
        title: "Account Created",
        description: "Your admin account has been successfully created. Please login.",
      });
      router.push('/login'); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Signup failed:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
       <Header />
       <main className="flex flex-1 items-center justify-center bg-secondary p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Create Admin Account</CardTitle>
              <CardDescription>Register a new admin account.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Signup Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>
               <div className="mt-4 text-center text-sm">
                 <Link href="/" className="underline text-muted-foreground hover:text-primary">
                   Back to Shop
                 </Link>
                 <span className="mx-2 text-muted-foreground">|</span>
                 <Link href="/login" className="underline text-muted-foreground hover:text-primary">
                   Already have an account? Login
                 </Link>
              </div>
            </CardContent>
          </Card>
       </main>
         <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12 bg-background">
           <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
             <span>© {new Date().getFullYear()} BeYou. All rights reserved.</span>
             <div className="flex space-x-4 mt-4 md:mt-0">
               <a href="https://www.instagram.com/ayeshaaa.forlife?igsh=dzdoMWZhcTZicXZp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                 <Instagram className="h-6 w-6" />
               </a>
               <a href="https://youtube.com/@beyoubyayeshaa?si=enC0JxhOQ1vSL5IW" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                 <Youtube className="h-6 w-6" />
               </a>
             </div>
           </div>
          </footer>
    </div>
  );
}
