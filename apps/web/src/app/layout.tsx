import type { Metadata } from 'next';
import Script from 'next/script';
import { Providers } from '@/lib/providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: "Jobsy - Jamaica's Service Marketplace",
  description:
    'Find and book trusted local service providers across Jamaica. From home repairs to personal care, Jobsy connects you with skilled professionals.',
  keywords: ['Jamaica', 'services', 'marketplace', 'booking', 'local professionals'],
  openGraph: {
    title: "Jobsy - Jamaica's Service Marketplace",
    description:
      'Find and book trusted local service providers across Jamaica.',
    type: 'website',
    locale: 'en_JM',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-PLACEHOLDER"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <ErrorBoundary>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
