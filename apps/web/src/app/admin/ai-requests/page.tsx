'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cnFormat } from '@/lib/utils';
import { api } from '@/lib/api';
import { Brain, ExternalLink, Eye } from 'lucide-react';

const STATUS_FILTERS = ['Todos', 'Pendiente', 'Revisado', 'Cotizado', 'Rechazado'];

const STATUS_MAP: Record<string, string | undefined> = {
  'Todos': undefined,
  'Pendiente': 'PENDING',
  'Revisado': 'REVIEWED',
  'Cotizado': 'COMPLETED',
  'Rechazado': 'REJECTED',
};

function extractMarketplace(url?: string): string {
  if (!url) return 'Desconocido';
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return hostname.replace('www.', '').split('.')[0] || 'Desconocido';
  } catch {
    return url.split('/')[0] || 'Desconocido';
  }
}

const statusBadge = (status: string) => {
  const labelMap: Record<string, string> = {
    PENDING: 'Pendiente',
    REVIEWED: 'Revisado',
    COMPLETED: 'Cotizado',
    REJECTED: 'Rechazado',
  };
  const variants: Record<string, 'warning' | 'secondary' | 'success' | 'destructive'> = {
    PENDING: 'warning',
    REVIEWED: 'secondary',
    COMPLETED: 'success',
    REJECTED: 'destructive',
  };
  const display = labelMap[status] || status;
  return <Badge variant={variants[status] || 'secondary'}>{display}</Badge>;
};

export default function AdminAIRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
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
        const res = await api.get<{ data: any[] }>('/ai-requests', params);
        if (cancelled) return;
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [statusFilter, retryKey]);

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    setIsReviewing(requestId);
    try {
      await api.post(`/ai-requests/${requestId}/review`, { action, notes: reviewNotes || undefined });
      showToast(`Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'}`);
      setExpandedId(null);
      setReviewNotes('');
      setRetryKey(k => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al revisar');
    } finally {
      setIsReviewing(null);
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
        <h1 className="text-2xl font-bold tracking-tight">Solicitudes IA</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de productos por enlace</p>
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
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Marketplace</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <Fragment key={req.id}>
                      <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium">{req.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={req.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
                          >
                            {req.originalUrl}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm">{req.user?.name || 'Desconocido'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{extractMarketplace(req.originalUrl)}</td>
                        <td className="px-4 py-3">{statusBadge(req.status)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(req.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setExpandedId(expandedId === req.id ? null : req.id);
                              setReviewNotes('');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {expandedId === req.id ? 'Cerrar' : 'Review'}
                          </Button>
                        </td>
                      </tr>
                      {expandedId === req.id && (
                        <tr className="bg-muted/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-muted-foreground">URL:</span>{' '}
                                  <a href={req.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {req.originalUrl}
                                  </a>
                                </div>
                                <div><span className="text-muted-foreground">Usuario:</span> {req.user?.name || 'Desconocido'}</div>
                                <div><span className="text-muted-foreground">Marketplace:</span> {extractMarketplace(req.originalUrl)}</div>
                                <div><span className="text-muted-foreground">Estado:</span> {statusBadge(req.status)}</div>
                                <div><span className="text-muted-foreground">Fecha:</span> {cnFormat(req.createdAt)}</div>
                              </div>

                              {req.status === 'PENDING' ? (
                                <div className="pt-3 border-t space-y-3">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Notas de revisión</label>
                                    <textarea
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      placeholder="Agregar notas (opcional)..."
                                      rows={3}
                                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Button
                                      size="sm"
                                      onClick={() => handleReview(req.id, 'approve')}
                                      disabled={isReviewing === req.id}
                                    >
                                      {isReviewing === req.id ? 'Aprobando...' : 'Aprobar'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReview(req.id, 'reject')}
                                      disabled={isReviewing === req.id}
                                    >
                                      {isReviewing === req.id ? 'Rechazando...' : 'Rechazar'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="pt-3 border-t">
                                  <p className="text-muted-foreground">Ya fue revisado — {statusBadge(req.status)}</p>
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
              {requests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No hay solicitudes{statusFilter !== 'Todos' ? ` con estado "${statusFilter}"` : ''}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
