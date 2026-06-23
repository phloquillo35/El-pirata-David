import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { LayoutClient } from '@/components/layout/LayoutClient';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'El Pirata David — Importaciones Premium en Argentina',
  description: 'Los mejores productos importados directo a tu puerta. Tecnología, hogar y más con envío a toda Argentina.',
  keywords: 'importados, Argentina, compras online, productos importados, tecnología',
  openGraph: {
    title: 'El Pirata David — Importaciones Premium en Argentina',
    description: 'Los mejores productos importados directo a tu puerta.',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <LayoutClient>{children}</LayoutClient>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
