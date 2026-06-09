'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cnFormat } from '@/lib/utils';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Brain,
  ExternalLink,
} from 'lucide-react';

const STATS = [
  { label: 'Total Ventas', value: '$ 45.280.000', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
  { label: 'Pedidos Pendientes', value: '12', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { label: 'Productos', value: '156', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  { label: 'Usuarios', value: '1,243', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
];

const RECENT_ORDERS = [
  { id: '#ORD-001', customer: 'Carlos Mendoza', date: '2025-05-28', total: 2500000, status: 'Completado', type: 'Directa' },
  { id: '#ORD-002', customer: 'María López', date: '2025-05-27', total: 850000, status: 'Pendiente', type: 'Enlace' },
  { id: '#ORD-003', customer: 'Juan Pérez', date: '2025-05-26', total: 5200000, status: 'Envío', type: 'Directa' },
  { id: '#ORD-004', customer: 'Ana García', date: '2025-05-25', total: 350000, status: 'Completado', type: 'Directa' },
  { id: '#ORD-005', customer: 'Pedro González', date: '2025-05-24', total: 1800000, status: 'Cancelado', type: 'Enlace' },
];

const LOW_STOCK = [
  { name: 'Laptop Pro 15"', sku: 'LPT-001', stock: 5, minStock: 10 },
  { name: 'Cámara Digital 4K', sku: 'CAM-003', stock: 3, minStock: 8 },
  { name: 'Smart TV 50" 4K', sku: 'TV-002', stock: 8, minStock: 15 },
  { name: 'Auriculares Bluetooth', sku: 'AUR-005', stock: 6, minStock: 20 },
];

const RECENT_AI_REQUESTS = [
  { id: 'REQ-001', url: 'amazon.com/producto-1', user: 'María López', status: 'Pendiente', date: '2025-05-28' },
  { id: 'REQ-002', url: 'aliexpress.com/item-2', user: 'Pedro González', status: 'Revisado', date: '2025-05-27' },
  { id: 'REQ-003', url: 'mercadolibre.com/item-3', user: 'Lucía Ramírez', status: 'Cotizado', date: '2025-05-26' },
  { id: 'REQ-004', url: 'amazon.com/producto-4', user: 'Carlos Mendoza', status: 'Pendiente', date: '2025-05-25' },
];

const MONTHLY_REVENUE = [
  { month: 'Enero', value: 6500000, max: 100 },
  { month: 'Febrero', value: 7200000, max: 100 },
  { month: 'Marzo', value: 5800000, max: 100 },
  { month: 'Abril', value: 8100000, max: 100 },
  { month: 'Mayo', value: 7600000, max: 100 },
  { month: 'Junio', value: 9200000, max: 100 },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE.map((r) => r.value));

const statusBadge = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'default' | 'destructive' | 'secondary'> = {
    Completado: 'success',
    Pendiente: 'warning',
    Envío: 'default',
    Cancelado: 'destructive',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

const aiStatusBadge = (status: string) => {
  const variants: Record<string, 'warning' | 'success' | 'default' | 'secondary'> = {
    Pendiente: 'warning',
    Revisado: 'secondary',
    Cotizado: 'success',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de la tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +12.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {MONTHLY_REVENUE.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-md relative group"
                    style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                  >
                    <div className="w-full bg-primary rounded-t-md transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Stock Bajo</CardTitle>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {LOW_STOCK.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {LOW_STOCK.map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{item.stock}</p>
                  <p className="text-xs text-muted-foreground">min: {item.minStock}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pedidos Recientes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/orders">Ver Todos</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.id}</span>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.customer} • {cnFormat(order.date)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Solicitudes IA Recientes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/ai-requests">Ver Todos</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_AI_REQUESTS.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{req.id}</span>
                      {aiStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{req.url}</p>
                    <p className="text-xs text-muted-foreground">{req.user} • {cnFormat(req.date)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 ml-2" asChild>
                    <a href={`/admin/ai-requests`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
