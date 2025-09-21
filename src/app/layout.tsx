import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://beyoushop.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BeYou - Beauty & Custom Prints',
    template: '%s | BeYou - Beauty & Custom Prints',
  },
  description: `A journey from Eidi to Enterprise

What started with my Eidi at 18 has grown into a passion project close to my heart. Rooted in creativity and love for memories, I offer creative prints and affordable cosmetics. Each piece crafted with care and purpose.

Your one-stop shop for affordable kawaii cosmetics, press-on nails, and aesthetic custom prints all made to turn heads and melt hearts.

From dreamy press-ons to cosmetics in the cutest packaging, we’re serving looks and vibes.
Want to freeze memories? Grab our custom polaroids, retro photo strips, or iconic music keychains and more. Perfect for gifting or treating yourself.
Whether it’s a birthday, breakup, or “just because,” we’ve got the most aesthetic gifts for every mood and moment.

Shop now to glow, gift, and glam!`,
  keywords: ['BeYou', 'beauty products', 'K-Beauty', 'fashion', 'clothing', 'accessories', 'online shopping', 'lipstick', 'nail art', 'custom prints', 'Gen Z fashion', 'Korean street fashion', 'minimalist fashion', 'Boho style', 'Y2K fashion', 'summer fashion', 'winter fashion', 'party wear', 'daily wear', 'oversized t-shirts', 'co-ord sets', 'crop tops', 'ripped jeans', 'hoodies', 'baggy jeans', 'kurti sets', 'denim jackets', 'printed shirts', 'high waist trousers', 'affordable fashion', 'under ₹1000', 'under ₹500', 'festive outfits', 'wedding outfits', 'free shipping', 'COD', 'kawaii cosmetics', 'press-on nails', 'aesthetic custom prints', 'polaroids', 'retro photo strips', 'music keychains', 'gifts', 'latest fashion trends for women 2025', 'Gen Z fashion style India', 'Korean street fashion online', 'minimalist fashion for women', 'Boho style dresses online India', 'Y2K fashion outfits India', 'summer fashion trends 2025', 'winter fashion essentials women', 'casual party wear for girls', 'daily wear outfit ideas for college', 'oversized t-shirts for men', 'co-ord sets for women online', 'crop tops under ₹500', 'ripped jeans for girls India', 'hoodies for women online', 'baggy jeans for Gen Z', 'cotton kurti sets for women', 'denim jackets for college students', 'printed shirts for men online', 'high waist trousers women India', 'affordable fashion India', 'dresses under ₹1000 online', 'trendy clothes under ₹500', 'budget fashion for college girls', 'stylish t-shirts under ₹300', 'cheap and trendy clothes India', 'fashion on a budget 2025', 'best fashion websites under 1K', 'jeans under ₹800 India', 'kurtis under ₹600 online', 'festive outfits for Diwali', 'summer wear for girls', 'winter layering ideas India', 'ethnic outfits for weddings', 'Raksha Bandhan dress ideas', 'Navratri outfit collection', 'date night outfit ideas', 'airport look clothes India', 'college farewell outfit trends', 'daily casual wear for students', 'online fashion store India', 'free shipping clothes India', 'best clothing sites for tier 2 cities', 'trendy clothes in Delhi NCR', 'fashion boutique online Mumbai', "women’s wear store Bangalore", 'COD clothing store India', 'clothing delivery in 2–3 days India', 'affordable fashion near me', 'online shopping for girls clothes India'],
  authors: [{ name: 'BeYou by Ayesha', url: SITE_URL }],
  creator: 'BeYou by Ayesha',
  publisher: 'BeYou by Ayesha',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: {
      default: 'BeYou - Beauty & Custom Prints',
      template: '%s | BeYou - Beauty & Custom Prints',
    },
    description: `A journey from Eidi to Enterprise. Your one-stop shop for affordable kawaii cosmetics, press-on nails, and aesthetic custom prints. Shop now to glow, gift, and glam!`,
    url: SITE_URL,
    siteName: 'BeYou',
    images: [
      {
        url: '/icons/BeYou.png',
        width: 130,
        height: 130, // Maintaining square aspect ratio
        alt: 'BeYou Logo',
      },
    ],
    locale: 'en_IN', 
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'BeYou - Beauty & Custom Prints',
      template: '%s | BeYou - Beauty & Custom Prints',
    },
    description: 'A journey from Eidi to Enterprise. Your one-stop shop for affordable kawaii cosmetics, press-on nails, and aesthetic custom prints. Shop now to glow, gift, and glam!',
    images: [`${SITE_URL}/icons/BeYou.png`], 
  },

  icons: {
    icon: '/icons/BeYou.png',
    shortcut: '/icons/BeYou.png',
    apple: '/icons/BeYou.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' }, 
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' }, 
  ],
  colorScheme: 'light dark',
};

// JSON-LD for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BeYou",
  "url": SITE_URL,
  "logo": `${SITE_URL}/icons/BeYou.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91 8088374457",
    "contactType": "Customer Service",
    "email": "be.you1914@gmail.com"
  },
  "sameAs": [
    "https://www.instagram.com/ayeshaaa.forlife?igsh=dzdoMWZhcTZicXZp",
    "https://youtube.com/@beyoubyayeshaa?si=enC0JxhOQ1vSL5IW"
  ]
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
