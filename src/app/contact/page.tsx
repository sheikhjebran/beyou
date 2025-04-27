
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
          <h1 className="text-4xl font-bold text-center mb-10 text-primary">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                <CardDescription>We'd love to hear from you. Reach out via email or phone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <a href="mailto:support@beyou.com" className="text-foreground hover:text-primary transition-colors">
                    support@beyou.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  {/* Replace with your actual phone number */}
                  <a href="tel:+1234567890" className="text-foreground hover:text-primary transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
                {/* Placeholder for contact form or more info */}
                <p className="text-muted-foreground pt-4">
                  Alternatively, fill out our contact form (coming soon!) or visit us during business hours.
                </p>
              </CardContent>
            </Card>
             <Card className="shadow-lg">
               <CardHeader>
                 <CardTitle className="text-2xl">Our Location</CardTitle>
                 <CardDescription>Find our boutique.</CardDescription>
               </CardHeader>
               <CardContent>
                 {/* Placeholder for map or address */}
                 <p className="text-foreground">
                   123 Elegance Avenue,
                   <br />
                   Fashion City, ST 12345
                 </p>
                  <div className="mt-4 h-48 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Map Placeholder
                 </div>
               </CardContent>
             </Card>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        © {new Date().getFullYear()} BeYou. All rights reserved.
      </footer>
    </div>
  );
}
