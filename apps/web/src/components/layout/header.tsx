'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Menu, X, User } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart?.totalItems ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            El Pirata David
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/products" className="nav-link uppercase tracking-[0.15em] text-[11px]">
            Productos
          </Link>
          <Link href="/ai-requests" className="nav-link uppercase tracking-[0.15em] text-[11px]">
            Pedido por Enlace
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center px-[3px]">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center">
                <Link href="/profile" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4" />
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <span className="text-[11px] uppercase tracking-[0.15em]">Admin</span>
                  </Link>
                )}
                <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-[11px] uppercase tracking-[0.15em]">Salir</span>
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Link href="/cart" className="relative p-2 text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center px-[3px]">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-muted-foreground">
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 pb-6 pt-2 space-y-4 bg-background/95 backdrop-blur-2xl animate-fade-in">
          <Link href="/products" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
            Productos
          </Link>
          <Link href="/ai-requests" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
            Pedido por Enlace
          </Link>
          <div className="h-px bg-border" />
          <Link href="/cart" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
            Carrito
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                Mi Perfil
              </Link>
              <Link href="/orders" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                Mis Pedidos
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button onClick={logout} className="block py-2 text-sm text-muted-foreground">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="flex-1 text-center py-2 text-sm border border-border rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Ingresar
              </Link>
              <Link href="/auth/register" className="flex-1 text-center py-2 text-sm bg-foreground text-background rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
