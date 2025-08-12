
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - BeYou',
  description: 'Learn about how BeYou by Ayesha collects, uses, and protects your personal information. Our commitment to your privacy.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy - BeYou',
    description: 'Our commitment to your privacy at BeYou. Understand how we handle your data.',
    url: '/privacy-policy',
  },
  twitter: {
    title: 'Privacy Policy - BeYou',
    description: 'Our commitment to your privacy at BeYou. Understand how we handle your data.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <section className="my-12">
          <div className="text-center mb-10">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Your privacy is important to us.</p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Our Commitment to Your Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                At Be You by Ayesha, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you interact with our website or contact us through WhatsApp.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground pt-2">1. Information We Collect</h3>
              <p>
                When you interact with us, we may collect the following information:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>
                  <strong>Personal Information:</strong> Name, phone number, and any other details you voluntarily share through WhatsApp or our contact form.
                </li>
                <li>
                  <strong>Technical Information:</strong> Device type, browser type, and IP address (collected automatically through website analytics).
                </li>
                <li>
                  <strong>Usage Data:</strong> Information on how you navigate and use our website.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">2. How We Use Your Information</h3>
              <p>
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Communicate with you and respond to your inquiries.</li>
                <li>Provide product details and complete your orders via WhatsApp.</li>
                <li>Improve our website and customer experience.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">3. How We Communicate with You</h3>
              <p>
                We use WhatsApp as our main communication platform for orders and inquiries. Please note:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Conversations on WhatsApp are subject to WhatsApp’s own Privacy Policy.</li>
                <li>We will not contact you for promotional purposes unless you have given us permission.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">4. Data Sharing</h3>
              <p>
                We do not share or sell your personal information to third parties.
                Your data may be visible to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>WhatsApp (as per their terms).</li>
                <li>Our internal team for order processing and customer service.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">5. Cookies and Tracking</h3>
              <p>
                Our website may use cookies to enhance your experience and track basic usage data. You can manage or disable cookies in your browser settings.
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">6. Data Security</h3>
              <p>
                We take reasonable precautions to protect your information.
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">7. Your Rights</h3>
              <p>
                You may request to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Access the data you’ve shared with us.</li>
                <li>Correct or delete your information.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-foreground pt-2">Contact Us</h3>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
                <br />
                BeYou Customer Service
                <br />
                Email: be.you1914@gmail.com
                <br />
                Phone: +91 8088374457
              </p>
              <p className="text-xs pt-4">
                This policy is effective as of {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}. We reserve the right to make changes to this Privacy Policy at any time and for any reason.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
