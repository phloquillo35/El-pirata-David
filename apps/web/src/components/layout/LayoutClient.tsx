'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
