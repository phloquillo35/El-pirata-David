'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Globe, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, truncate, cnFormat } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

type RequestStatus = 'PENDING' | 'PROCESSING' | 'ANALYZED' | 'ALTERNATIVES_FOUND' | 'COMPLETED' | 'REJECTED' | 'FAILED';

interface AiRequest {
  id: string;
  url: string;
  notes: string;
  status: RequestStatus;
  marketplace: string;
  createdAt: string;
}

function getStatusBadgeVariant(status: RequestStatus) {
  const map: Record<RequestStatus, 'warning' | 'default' | 'secondary' | 'success' | 'destructive' | 'outline'> = {
    PENDING: 'warning',
    PROCESSING: 'default',
    ANALYZED: 'secondary',
    ALTERNATIVES_FOUND: 'success',
    COMPLETED: 'success',
    REJECTED: 'destructive',
    FAILED: 'destructive',
  };
  return map[status];
}

function getStatusLabel(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    ANALYZED: 'Analizado',
    ALTERNATIVES_FOUND: 'Alternativas encontradas',
    COMPLETED: 'Completado',
    REJECTED: 'Rechazado',
    FAILED: 'Fallido',
  };
  return map[status];
}

function getStatusIcon(status: RequestStatus) {
  const map: Record<RequestStatus, typeof Clock> = {
    PENDING: Clock,
    PROCESSING: Loader2,
    ANALYZED: CheckCircle,
    ALTERNATIVES_FOUND: CheckCircle,
    COMPLETED: CheckCircle,
    REJECTED: XCircle,
    FAILED: AlertCircle,
  };
  return map[status];
}

const MARKETPLACES = [
  { name: 'Mercado Libre', icon: Globe },
  { name: 'Amazon', icon: Globe },
  { name: 'AliExpress', icon: Globe },
  { name: 'eBay', icon: Globe },
];

const MOCK_REQUESTS: AiRequest[] = [
  { id: 'REQ-001', url: 'https://www.mercadolibre.com.ar/smartphone-xyz-pro', notes: '', status: 'PENDING', marketplace: 'Mercado Libre', createdAt: '2026-05-28T10:30:00Z' },
  { id: 'REQ-002', url: 'https://www.amazon.com/dp/B0EXAMPLE', notes: 'Busco la version de 256GB', status: 'PROCESSING', marketplace: 'Amazon', createdAt: '2026-05-27T15:45:00Z' },
  { id: 'REQ-003', url: 'https://www.aliexpress.com/item/100500123456.html', notes: '', status: 'ALTERNATIVES_FOUND', marketplace: 'AliExpress', createdAt: '2026-05-25T09:00:00Z' },
  { id: 'REQ-004', url: 'https://www.ebay.com/itm/123456789', notes: 'Necesito envio a Argentina', status: 'COMPLETED', marketplace: 'eBay', createdAt: '2026-05-20T14:20:00Z' },
  { id: 'REQ-005', url: 'https://www.mercadolibre.com.mx/producto-fallido', notes: '', status: 'FAILED', marketplace: 'Mercado Libre', createdAt: '2026-05-18T11:10:00Z' },
];

export default function AiRequestsPage() {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [requests, setRequests] = useState<AiRequest[]>(MOCK_REQUESTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      new URL(url);
    } catch {
      setError('Ingresá una URL válida');
      return;
    }

    const newRequest: AiRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      url,
      notes,
      status: 'PENDING',
      marketplace: url.includes('mercadolibre') ? 'Mercado Libre' : url.includes('amazon') ? 'Amazon' : url.includes('aliexpress') ? 'AliExpress' : url.includes('ebay') ? 'eBay' : 'Otro',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    setUrl('');
    setNotes('');
    showToast('Producto solicitado exitosamente');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Link2 className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Iniciá sesión para solicitar productos</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Necesitás estar registrado para poder solicitar productos por enlace. Iniciá sesión o creá una cuenta.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/auth/register">Crear Cuenta</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pedidos por Enlace</h1>
        <p className="text-muted-foreground">
          Encontraste un producto en otra tienda y querés que lo importemos para vos? Pegá el enlace y te lo conseguimos.
        </p>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Solicitar Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Pegá el enlace del producto aquí..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
              />
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
            <div>
              <textarea
                placeholder="Notas opcionales (color, tamaño, variante...)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <Button type="submit" disabled={!url.trim()}>
              Solicitar Producto
            </Button>
            <p className="text-xs text-muted-foreground">
              Soportamos enlaces de Mercado Libre, Amazon, AliExpress, eBay y más
            </p>
            <div className="flex gap-3">
              {MARKETPLACES.map((mp) => (
                <div key={mp.name} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
                  <mp.icon className="h-3 w-3" />
                  {mp.name}
                </div>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Mis Solicitudes</h2>
        {requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Todavía no hiciste ninguna solicitud.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const StatusIcon = getStatusIcon(req.status);
              const isExpanded = expandedId === req.id;

              return (
                <Card key={req.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="w-full text-left"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <StatusIcon className={`h-5 w-5 shrink-0 ${
                            req.status === 'FAILED' || req.status === 'REJECTED' ? 'text-destructive' :
                            req.status === 'COMPLETED' || req.status === 'ALTERNATIVES_FOUND' ? 'text-green-600' :
                            req.status === 'PROCESSING' ? 'text-primary' : 'text-yellow-500'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{req.url}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {req.id} &middot; {cnFormat(req.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(req.status)} className="shrink-0">
                          {getStatusLabel(req.status)}
                        </Badge>
                      </div>
                    </CardContent>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Marketplace:</span>
                        <span className="font-medium">{req.marketplace}</span>
                      </div>
                      {req.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notas:</span>
                          <p className="mt-0.5">{req.notes}</p>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ai-requests/${req.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
