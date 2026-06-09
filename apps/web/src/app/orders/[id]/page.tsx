'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Package, LogIn, ArrowLeft, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, cnFormat } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface TrackingEntry {
  status: string;
  date: Date;
  description: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  type: 'STOCK' | 'IMPORT';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    phone: string;
  };
  payment: {
    method: string;
    reference: string;
  };
  tracking: TrackingEntry[];
}

const MOCK_ORDER: Order = {
  id: '1',
  orderNumber: 'EPD-2025-0001',
  date: new Date('2025-05-15'),
  status: 'DELIVERED',
  type: 'STOCK',
  subtotal: 456000,
  shipping: 0,
  tax: 45600,
  total: 501600,
  items: [
    { id: 'i1', name: 'Auriculares Bluetooth Sony', quantity: 1, price: 350000 },
    { id: 'i2', name: 'Cable USB-C 2m', quantity: 2, price: 53000 },
  ],
  shippingAddress: {
    name: 'Juan Pérez',
    street: 'Av. Mariscal López 1234',
    city: 'Buenos Aires',
    state: 'Central',
    phone: '+54 11 5555 2345',
  },
  payment: {
    method: 'Mercado Pago - Tarjeta de Crédito',
    reference: 'MP-2025-000001',
  },
  tracking: [
    { status: 'PENDING', date: new Date('2025-05-15'), description: 'Pedido recibido' },
    { status: 'PROCESSING', date: new Date('2025-05-16'), description: 'Pedido en proceso de preparación' },
    { status: 'SHIPPED', date: new Date('2025-05-17'), description: 'Pedido enviado al domicilio' },
    { status: 'DELIVERED', date: new Date('2025-05-19'), description: 'Pedido entregado con éxito' },
  ],
};

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'secondary' | 'destructive'> = {
  DELIVERED: 'success',
  SHIPPED: 'success',
  PROCESSING: 'warning',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
};

const statusLabel: Record<string, string> = {
  DELIVERED: 'Entregado',
  SHIPPED: 'Enviado',
  PROCESSING: 'Procesando',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelado',
};

const typeLabel: Record<string, string> = {
  STOCK: 'Stock Propio',
  IMPORT: 'Importado',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, isLoading } = useAuth();
  const order: Order | undefined = MOCK_ORDER.id === id ? MOCK_ORDER : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Inicia Sesión</h1>
        <p className="text-muted-foreground mb-8">Debes iniciar sesión para ver el detalle del pedido.</p>
        <Button asChild size="lg">
          <Link href="/auth/login">
            <LogIn className="h-5 w-5 mr-2" />
            Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    notFound();
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Pedido {order.orderNumber}</h1>
          <p className="text-muted-foreground">{cnFormat(order.date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{typeLabel[order.type]}</Badge>
          <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/10 via-accent to-primary/5 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-muted-foreground">{order.shippingAddress.street}</p>
              <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-muted-foreground">{order.payment.method}</p>
              <p className="text-muted-foreground">Referencia: {order.payment.reference}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{order.shipping === 0 ? <span className="text-green-600 font-medium">GRATIS</span> : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.tracking.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full border-2 ${
                        index === order.tracking.length - 1
                          ? 'bg-primary border-primary'
                          : 'bg-background border-muted-foreground'
                      }`} />
                      {index < order.tracking.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{cnFormat(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
