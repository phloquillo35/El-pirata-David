'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const MOCK_ITEMS: CartItem[] = [
  { id: '1', name: 'Auriculares Bluetooth', price: 350000, quantity: 1 },
  { id: '2', name: 'Mouse Inalámbrico', price: 120000, quantity: 2 },
  { id: '3', name: 'Teclado Mecánico RGB', price: 89000, quantity: 1 },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(MOCK_ITEMS);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 15000;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-24">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">
            Parece que aún no has agregado productos. Explora nuestro catálogo y encuentra lo que buscas.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              Explorar Productos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Carrito de Compras</h1>
        <p className="text-sm text-muted-foreground">{items.length} artículo{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-accent transition-colors">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(item.price)} c/u
                  </p>
                </div>
                <div className="flex items-center border border-input rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="p-2 hover:bg-secondary transition-colors disabled:opacity-50 rounded-l-lg"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-medium tabular-nums border-x border-input py-2">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-2 hover:bg-secondary transition-colors rounded-r-lg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-semibold w-28 text-right tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button variant="link" asChild className="px-0 text-sm text-muted-foreground hover:text-foreground">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Seguir Comprando
              </Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border-border/80">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg font-semibold tracking-tight">Resumen del Pedido</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">GRATIS</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3 w-3" />
                      Envío gratis en pedidos mayores a {formatPrice(500000)}
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos (10%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl tracking-tight">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceder al Pago</Link>
                </Button>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Pago seguro
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    Mercado Pago
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
