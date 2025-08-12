
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exchange & Refund Policy - BeYou',
  description: 'Read the Exchange & Refund Policy for BeYou. Understand our terms regarding damaged items and final sales for hygienic and custom products.',
  alternates: {
    canonical: '/exchange-refund-policy',
  },
   openGraph: {
    title: 'Exchange & Refund Policy - BeYou',
    description: 'Our policy on exchanges and refunds for products purchased from BeYou.',
    url: '/exchange-refund-policy',
  },
  twitter: {
    title: 'Exchange & Refund Policy - BeYou',
    description: 'Our policy on exchanges and refunds for products purchased from BeYou.',
  },
};

export default function ExchangeRefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
          <div className="text-center mb-10">
            <RefreshCw className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl font-bold text-foreground">Exchange & Refund Policy</h1>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">at Be You by Ayesha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-center">
                We’re so happy you chose us to add a little sparkle to your day!
                <br />
                Each order is packed with care and a whole lot of love just for you.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground pt-2 text-center">All Sales Are Final</h3>
              <p>
                Due to the hygienic and custom-made nature of our products we do not offer any exchanges or refunds.
                We encourage you to review your order carefully before placing it, your perfect picks deserve a perfect match.
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">Received a Damaged Item?</h3>
              <p>
                If you receive a damaged product, you must share an unboxing video (clearly showing the package being opened for the first time) within 24 hours of delivery.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>The video must be unedited, starting from the unopened parcel to the point the damage is clearly visible.</li>
                <li>Without this video proof, we will not be able to process any exchange request.</li>
              </ul>
              <p>
                Please send the video and order details to our customer service via WhatsApp.
              </p>
              
              <p className="text-center pt-4">
                Thank you for understanding and being part of our little world.
                <br />
                Your support means everything!
              </p>
              <p className="text-right font-semibold pt-2">- Be You by Ayesha</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
