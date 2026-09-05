import { Geist, Geist_Mono } from 'next/font/google';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/query-provider';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { ThemeProvider } from '@/shared/components/layout/theme-provider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Perigee | Commerce in close orbit',
  description:
    'Curated marketplace with distinctive independent brands and their products, directly sourced.',
  icons: {
    icon: [{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary selection:bg-accent/20 selection:text-accent">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {/* Domain-agnostic Header on every page */}
            <Header />

            {/* Main content area */}
            <main className="flex-1 flex flex-col">{children}</main>

            {/* Domain-agnostic Footer on every page */}
            <Footer />

            {/* Global toast notification system */}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
