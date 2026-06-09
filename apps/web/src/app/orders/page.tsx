'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, LogIn, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, cnFormat } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  type: 'STOCK' | 'IMPORT';
  items: OrderItem[];
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'EPD-2025-0001',
    date: new Date('2025-05-15'),
    status: 'DELIVERED',
    total: 456000,
    type: 'STOCK',
    items: [
      { id: 'i1', name: 'Auriculares Bluetooth Sony', quantity: 1, price: 350000 },
      { id: 'i2', name: 'Cable USB-C 2m', quantity: 2, price: 53000 },
    ],
  },
  {
    id: '2',
    orderNumber: 'EPD-2025-0002',
    date: new Date('2025-05-20'),
    status: 'PROCESSING',
    total: 890000,
    type: 'IMPORT',
    items: [
      { id: 'i3', name: 'iPhone 15 Pro Case', quantity: 1, price: 450000 },
      { id: 'i4', name: 'AirPods Pro 2', quantity: 1, price: 440000 },
    ],
  },
  {
    id: '3',
    orderNumber: 'EPD-2025-0003',
    date: new Date('2025-05-25'),
    status: 'SHIPPED',
    total: 250000,
    type: 'STOCK',
    items: [
      { id: 'i5', name: 'Teclado Mecánico Redragon', quantity: 1, price: 250000 },
    ],
  },
  {
    id: '4',
    orderNumber: 'EPD-2025-0004',
    date: new Date('2025-05-28'),
    status: 'PENDING',
    total: 178000,
    type: 'IMPORT',
    items: [
      { id: 'i6', name: 'Mouse Pad XXL', quantity: 1, price: 89000 },
      { id: 'i7', name: 'Soporte para Monitor', quantity: 1, price: 89000 },
    ],
  },
];

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

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <p className="text-muted-foreground mb-8">Debes iniciar sesión para ver tus pedidos.</p>
        <Button asChild size="lg">
          <Link href="/auth/login">
            <LogIn className="h-5 w-5 mr-2" />
            Iniciar Sesión
          </Link>
        </Button>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mis Pedidos</h1>

      {MOCK_ORDERS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tienes pedidos</h2>
          <p className="text-muted-foreground mb-8">Realiza tu primera compra y aquí verás el historial.</p>
          <Button asChild>
            <Link href="/products">Ir a Comprar</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => (
            <Card key={order.id}>
              <div
                className="p-4 cursor-pointer select-none"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button className="shrink-0">
                      {expandedId === order.id ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{cnFormat(order.date)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Badge variant="secondary">{typeLabel[order.type]}</Badge>
                      <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                    </div>
                    <p className="font-bold text-primary shrink-0">{formatPrice(order.total)}</p>
                    <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                      <Link href={`/orders/${order.id}`}>Ver Detalle</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex sm:hidden items-center gap-2 mt-2">
                  <Badge variant="secondary">{typeLabel[order.type]}</Badge>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </div>
              </div>
              {expandedId === order.id && (
                <CardContent className="border-t pt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
