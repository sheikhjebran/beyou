
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - BeYou',
  description: 'Get in touch with BeYou for inquiries about our beauty products, fashion items, or any other questions. Find our contact details and location.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - BeYou',
    description: 'Reach out to BeYou. We are here to help with your beauty and fashion needs.',
    url: '/contact',
  },
  twitter: {
    title: 'Contact Us - BeYou',
    description: 'Reach out to BeYou. We are here to help with your beauty and fashion needs.',
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
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
                  <a href="mailto:be.you1914@gmail.com" className="text-foreground hover:text-primary transition-colors">
                    be.you1914@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <a href="tel:+918088374457" className="text-foreground hover:text-primary transition-colors">
                    +91 8088374457
                  </a>
                </div>
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
                 <div className="flex items-start space-x-3">
                   <MapPin className="h-5 w-5 text-accent mt-1 shrink-0" />
                   <p className="text-foreground">
                     Aiza collections
                     <br />
                     298, Veera Pillai St, near Commercial Street,
                     <br />
                     Tasker Town, Shivaji Nagar,
                     <br />
                     Bengaluru, Karnataka 560001
                     <br />
                     India
                   </p>
                 </div>
                  <div className="mt-4 overflow-hidden rounded-md">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8173609590476!2d77.60642677507666!3d12.983530587332938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17f94cc3e2b1%3A0x3a153fc695c582f6!2sAiza%20Collections!5e0!3m2!1sen!2sin!4v1748719857977!5m2!1sen!2sin" 
                      width="100%" 
                      height="320"
                      className="border-0"
                      allowFullScreen={true}
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="BeYou Location Map">
                    </iframe>
                 </div>
               </CardContent>
             </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
