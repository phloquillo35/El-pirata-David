'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cnFormat } from '@/lib/utils';
import { Eye } from 'lucide-react';

const ORDERS = [
  { id: '#ORD-001', customer: 'Carlos Mendoza', date: '2025-05-28', total: 2500000, status: 'Completado', type: 'Directa' },
  { id: '#ORD-002', customer: 'María López', date: '2025-05-27', total: 850000, status: 'Pendiente', type: 'Enlace' },
  { id: '#ORD-003', customer: 'Juan Pérez', date: '2025-05-26', total: 5200000, status: 'Envío', type: 'Directa' },
  { id: '#ORD-004', customer: 'Ana García', date: '2025-05-25', total: 350000, status: 'Completado', type: 'Directa' },
  { id: '#ORD-005', customer: 'Pedro González', date: '2025-05-24', total: 1800000, status: 'Cancelado', type: 'Enlace' },
  { id: '#ORD-006', customer: 'Lucía Ramírez', date: '2025-05-23', total: 4200000, status: 'Pendiente', type: 'Directa' },
];

const STATUS_FILTERS = ['Todos', 'Pendiente', 'Completado', 'Envío', 'Cancelado'];

const statusBadge = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'default' | 'destructive' | 'secondary'> = {
    Completado: 'success',
    Pendiente: 'warning',
    Envío: 'default',
    Cancelado: 'destructive',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = ORDERS.filter((o) => statusFilter === 'Todos' || o.status === statusFilter);

  return (
    <div className="space-y-6">
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
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(order.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">{statusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.type}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay pedidos con estado &ldquo;{statusFilter}&rdquo;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
