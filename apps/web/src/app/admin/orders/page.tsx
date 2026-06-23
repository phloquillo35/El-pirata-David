'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import { Eye, ChevronUp } from 'lucide-react';

const STATUS_FILTERS = ['Todos', 'Pendiente', 'Confirmado', 'Procesando', 'Enviado', 'Completado', 'Cancelado', 'Reintegrado'];

const STATUS_MAP: Record<string, string | undefined> = {
  'Todos': undefined,
  'Pendiente': 'PENDING',
  'Confirmado': 'CONFIRMED',
  'Procesando': 'PROCESSING',
  'Enviado': 'SHIPPED',
  'Completado': 'DELIVERED',
  'Cancelado': 'CANCELLED',
  'Reintegrado': 'REFUNDED',
};

const TYPE_MAP: Record<string, string> = {
  'STOCK': 'Directa',
  'LINK': 'Enlace',
};

const statusBadge = (status: string) => {
  const labelMap: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Completado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reintegrado',
  };
  const variants: Record<string, 'success' | 'warning' | 'default' | 'destructive' | 'secondary'> = {
    PENDING: 'warning',
    CONFIRMED: 'warning',
    PROCESSING: 'warning',
    SHIPPED: 'success',
    DELIVERED: 'success',
    CANCELLED: 'destructive',
    REFUNDED: 'destructive',
  };
  const display = labelMap[status] || status;
  return <Badge variant={variants[status] || 'secondary'}>{display}</Badge>;
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reintegrado' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [statusDescription, setStatusDescription] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const params: any = { page: 1, limit: 100 };
        const apiStatus = STATUS_MAP[statusFilter];
        if (apiStatus) params.status = apiStatus;
        const res = await api.get<{ data: any[] }>('/orders/admin/all', params);
        if (cancelled) return;
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [statusFilter, retryKey]);

  const handleStatusChange = async (orderId: string) => {
    setChangingStatus(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: selectedStatus,
        description: statusDescription || `Estado cambiado a ${selectedStatus}`,
      });
      showToast('Estado actualizado');
      setRetryKey(k => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setChangingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona los pedidos de tus clientes</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground mb-4">{fetchError}</p>
              <Button variant="outline" onClick={() => setRetryKey(k => k + 1)}>Reintentar</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pedido</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                      <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{order.orderNumber || order.id}</td>
                        <td className="px-4 py-3 text-sm">{order.user?.name || 'Cliente'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(order.createdAt)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">{statusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{TYPE_MAP[order.type] || order.type}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setExpandedId(expandedId === order.id ? null : order.id);
                              setSelectedStatus(order.status || 'PENDING');
                              setStatusDescription('');
                            }}
                          >
                            {expandedId === order.id ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="space-y-4">
                              {order.items?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="pb-1 pr-2">Producto</th>
                                        <th className="pb-1 pr-2">SKU</th>
                                        <th className="pb-1 pr-2 text-right">Cant.</th>
                                        <th className="pb-1 pr-2 text-right">P/U</th>
                                        <th className="pb-1 pr-2 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item: any) => (
                                        <tr key={item.id} className="border-b last:border-0">
                                          <td className="py-1 pr-2">{item.name}</td>
                                          <td className="py-1 pr-2 text-muted-foreground">{item.sku}</td>
                                          <td className="py-1 pr-2 text-right">{item.quantity}</td>
                                          <td className="py-1 pr-2 text-right">{formatPrice(item.unitPrice)}</td>
                                          <td className="py-1 pr-2 text-right font-medium">{formatPrice(item.totalPrice)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              <div className="flex justify-end gap-8 text-sm">
                                <div className="space-y-1 text-right">
                                  <p>Subtotal: <span className="font-medium">{formatPrice(order.subtotal)}</span></p>
                                  <p>Envío: <span className="font-medium">{order.shippingCost ? formatPrice(order.shippingCost) : 'Gratis'}</span></p>
                                  <p>Impuestos: <span className="font-medium">{order.tax ? formatPrice(order.tax) : '-'}</span></p>
                                  <p className="text-base font-bold">Total: {formatPrice(order.total)}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-2 border-t">
                                <select
                                  value={selectedStatus}
                                  onChange={(e) => setSelectedStatus(e.target.value)}
                                  className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={statusDescription}
                                  onChange={(e) => setStatusDescription(e.target.value)}
                                  placeholder="Descripción (opcional)"
                                  className="rounded-md border border-input bg-transparent px-3 py-1.5 text-sm flex-1 max-w-xs"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(order.id)}
                                  disabled={changingStatus === order.id}
                                >
                                  {changingStatus === order.id ? 'Actualizando...' : 'Actualizar estado'}
                                </Button>
                              </div>

                              {order.tracking?.length > 0 && (
                                <div className="pt-2 border-t">
                                  <h4 className="text-sm font-semibold mb-2">Timeline</h4>
                                  <div className="space-y-2">
                                    {order.tracking.map((entry: any) => (
                                      <div key={entry.id} className="flex items-start gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <div>
                                          <div className="mb-0.5">{statusBadge(entry.status)}</div>
                                          {entry.description && (
                                            <p className="text-muted-foreground">{entry.description}</p>
                                          )}
                                          <p className="text-xs text-muted-foreground">{cnFormat(entry.createdAt)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No hay pedidos con estado &ldquo;{statusFilter}&rdquo;
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
