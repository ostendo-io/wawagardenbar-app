import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wawa Garden Bar - Order Food & Drinks',
  description:
    'Order delicious food and drinks from Wawa Garden Bar. Dine-in, pickup, or delivery available.',
  keywords: ['restaurant', 'food delivery', 'wawa cafe', 'garden bar'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
