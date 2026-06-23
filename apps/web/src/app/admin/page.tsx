'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  DollarSign,
  Package,
  Users,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Brain,
  ExternalLink,
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: ProductItem[];
  recentOrders: OrderItem[];
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: number; year: number; revenue: number; orderCount: number }[];
  recentAIRequests: AIRequestItem[];
}

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  minStock?: number;
  brand?: string;
}

interface OrderItem {
  id: string;
  orderNumber?: string;
  user?: { name: string };
  total: number;
  status: string;
  type?: string;
  createdAt: string;
}

interface AIRequestItem {
  id: string;
  originalUrl?: string;
  user?: { name: string };
  status: string;
  createdAt: string;
}

const MONTH_NAMES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
    Completado: 'success',
    Pendiente: 'warning',
    Envío: 'default',
    Cancelado: 'destructive',
  };
  const display = labelMap[status] || status;
  return <Badge variant={variants[status] || 'secondary'}>{display}</Badge>;
};

const aiStatusBadge = (status: string) => {
  const labelMap: Record<string, string> = {
    PENDING: 'Pendiente',
    REVIEWED: 'Revisado',
    COMPLETED: 'Completado',
    REJECTED: 'Rechazado',
  };
  const variants: Record<string, 'warning' | 'success' | 'default' | 'secondary' | 'destructive'> = {
    PENDING: 'warning',
    REVIEWED: 'secondary',
    COMPLETED: 'success',
    REJECTED: 'destructive',
    Pendiente: 'warning',
    Revisado: 'secondary',
    Cotizado: 'success',
  };
  const display = labelMap[status] || status;
  return <Badge variant={variants[status] || 'secondary'}>{display}</Badge>;
};

const STAT_CONFIG = [
  { label: 'Total Ventas', icon: DollarSign, key: 'totalRevenue' as const, format: (v: number) => formatPrice(v) },
  { label: 'Pedidos Pendientes', icon: Clock, key: 'pendingOrders' as const, format: (v: number) => String(v) },
  { label: 'Productos', icon: Package, key: 'totalProducts' as const, format: (v: number) => String(v) },
  { label: 'Usuarios', icon: Users, key: 'totalUsers' as const, format: (v: number) => String(v) },
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await api.get<DashboardData>('/admin/dashboard');
        if (cancelled) return;
        setDashboard(data);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadDashboard();
    return () => { cancelled = true; };
  }, [retryKey]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Error al cargar</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <Button variant="outline" onClick={() => setRetryKey(k => k + 1)}>Reintentar</Button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const maxRevenue = Math.max(...dashboard.monthlyRevenue.map((r) => r.revenue));

  function extractMarketplace(url?: string): string {
    if (!url) return 'Desconocido';
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return hostname.replace('www.', '').split('.')[0] || 'Desconocido';
    } catch {
      return url.split('/')[0] || 'Desconocido';
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de la tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map((stat) => {
          const Icon = stat.icon;
          const value = dashboard[stat.key];
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.format(value)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
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
              {dashboard.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-md relative group"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="w-full bg-primary rounded-t-md transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{MONTH_NAMES[item.month]?.slice(0, 3) || item.month}</span>
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
              {dashboard.lowStockProducts.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.lowStockProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku ? `SKU: ${item.sku}` : item.brand || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{item.stock}</p>
                  {item.minStock != null && <p className="text-xs text-muted-foreground">min: {item.minStock}</p>}
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
              {dashboard.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.orderNumber || order.id}</span>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.user?.name || 'Cliente'} • {cnFormat(order.createdAt)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    {order.type && <p className="text-xs text-muted-foreground">{order.type}</p>}
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
              {dashboard.recentAIRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{req.id}</span>
                      {aiStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{req.originalUrl || 'Sin URL'}</p>
                    <p className="text-xs text-muted-foreground">{req.user?.name || 'Desconocido'} • {cnFormat(req.createdAt)}</p>
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
