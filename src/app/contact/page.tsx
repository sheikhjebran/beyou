
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react'; // Added MapPin icon

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
          {/* Updated h1 to use text-foreground for black color */}
          <h1 className="text-4xl font-bold text-center mb-10 text-foreground">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                <CardDescription>We'd love to hear from you. Reach out via email or phone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  {/* Updated email */}
                  <a href="mailto:sheikhjebran@gmail.com" className="text-foreground hover:text-primary transition-colors">
                    sheikhjebran@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  {/* Updated phone number */}
                  <a href="tel:+919945662602" className="text-foreground hover:text-primary transition-colors">
                    +91 9945662602
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
                 {/* Updated address */}
                 <div className="flex items-start space-x-3">
                   <MapPin className="h-5 w-5 text-accent mt-1 shrink-0" />
                   <p className="text-foreground">
                     Commercial Street,
                     <br />
                     Bangalore, Karnataka
                     <br />
                     India
                   </p>
                 </div>
                  {/* Placeholder for map */}
                  <div className="mt-4 h-48 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Map Placeholder (Commercial Street, Bangalore)
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

