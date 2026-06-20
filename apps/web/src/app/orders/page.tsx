'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, LogIn, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import type { IOrder, PaginationMeta } from '@el-pirata-david/shared';



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

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await api.get<{ data: IOrder[]; meta: PaginationMeta }>('/orders', {
          page: 1,
          limit: 20,
        });
        if (cancelled) return;
        setOrders(res.data);
        setMeta(res.meta);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadOrders();
    return () => { cancelled = true; };
  }, [isAuthenticated, retryKey]);

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
        <h1 className="text-2xl font-bold mb-2">Error al cargar los pedidos</h1>
        <p className="text-muted-foreground mb-8">{fetchError}</p>
        <Button onClick={() => setRetryKey((k) => k + 1)} variant="outline">
          Reintentar
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

      {orders.length === 0 ? (
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
          {orders.map((order) => (
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
                      <p className="text-sm text-muted-foreground">{cnFormat(order.createdAt)}</p>
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
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
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
