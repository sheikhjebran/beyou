
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - BeYou',
  description: 'Details about BeYou by Ayesha\'s shipping process, delivery times, charges, and order tracking for India and international locations.',
  alternates: {
    canonical: '/shipping-policy',
  },
  openGraph: {
    title: 'Shipping Policy - BeYou',
    description: 'Learn about our shipping practices, delivery estimates, and charges.',
    url: '/shipping-policy',
  },
  twitter: {
    title: 'Shipping Policy - BeYou',
    description: 'Learn about our shipping practices, delivery estimates, and charges.',
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
          <div className="text-center mb-10">
            <Truck className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl font-bold text-foreground">Shipping Policy</h1>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Be You by Ayesha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-center">
                We’re so excited to pack and ship happiness your way! Here’s everything you need to know about how your order travels from us to you:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground pt-2">Where We Ship</h3>
              <p>
                We currently ship PAN India and to selected international locations. No matter where you are, we’ll try our best to reach you!
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">Processing & Delivery Time</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Order Processing: 2 working days</li>
                <li>Delivery Time: 2–4 working days (within India)</li>
              </ul>
              <p className="pl-4">(International delivery times may vary based on location)</p>
              <p className="pl-4">• Please note: No dispatches on Sundays or public holidays.</p>
              <p>
                Delays can occasionally happen due to unexpected reasons (like weather or courier issues), but we’ll always keep you updated!
              </p>
              
              <h3 className="text-xl font-semibold text-foreground pt-2">Shipping Charges</h3>
              <p>
                We offer minimal shipping rates, starting from ₹30.
                Final shipping charges are calculated at checkout based on your location.
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">Tracking Your Order</h3>
              <p>
                Once your order is packed and shipped, you’ll receive a tracking ID via your preferred contact method.
                We work with trusted courier partners, details will remain confidential and shared directly with you for your peace of mind.
              </p>
              
              <p className="text-center pt-4">
                Thank you for shopping with Be You by Ayesha - a little business with a big heart. Your trust means the world to us.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
