'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Package, LogIn, ArrowLeft, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import type { IOrder, IOrderTracking, IAddress, IPayment } from '@el-pirata-david/shared';



const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'secondary' | 'destructive'> = {
  DELIVERED: 'success',
  SHIPPED: 'success',
  PROCESSING: 'warning',
  CONFIRMED: 'warning',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

const statusLabel: Record<string, string> = {
  DELIVERED: 'Entregado',
  SHIPPED: 'Enviado',
  PROCESSING: 'Procesando',
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reintegrado',
};

const typeLabel: Record<string, string> = {
  STOCK: 'Stock Propio',
  LINK_REQUEST: 'Importado',
};

interface OrderDetail extends IOrder {
  shippingAddress: IAddress | null;
  payments: IPayment[];
  tracking: IOrderTracking[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [tracking, setTracking] = useState<IOrderTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadOrder() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await api.get<OrderDetail>(`/orders/${id}`);
        if (cancelled) return;
        setOrder(data);
        if (cancelled) return;
        setTracking(data.tracking ?? []);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Error al cargar el pedido');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadOrder();
    return () => { cancelled = true; };
  }, [id, isAuthenticated, retryKey]);

  if (authLoading) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Error al cargar el pedido</h1>
        <p className="text-muted-foreground mb-8">{fetchError}</p>
        <Button onClick={() => setRetryKey((k) => k + 1)} variant="outline">
          Reintentar
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
          <p className="text-muted-foreground">{cnFormat(order.createdAt)}</p>
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
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.totalPrice)}</p>
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
              <p className="font-medium">{order.shippingAddress?.fullName ?? 'Sin dirección'}</p>
              <p className="text-muted-foreground">{order.shippingAddress?.street ?? ''}</p>
              <p className="text-muted-foreground">{order.shippingAddress?.city ?? ''}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}</p>
              <p className="text-muted-foreground">{order.shippingAddress?.phone ?? ''}</p>
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
              <p className="text-muted-foreground">{order.payments?.[0]?.method ?? 'Sin información'}</p>
              <p className="text-muted-foreground">Referencia: {order.payments?.[0]?.transactionId ?? '-'}</p>
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
                <span>{order.shippingCost === 0 ? <span className="text-green-600 font-medium">GRATIS</span> : formatPrice(order.shippingCost)}</span>
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
                {tracking.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full border-2 ${
                        index === tracking.length - 1
                          ? 'bg-primary border-primary'
                          : 'bg-background border-muted-foreground'
                      }`} />
                      {index < tracking.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{cnFormat(entry.createdAt)}</p>
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
