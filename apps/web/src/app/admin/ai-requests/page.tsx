'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cnFormat } from '@/lib/utils';
import { Brain, ExternalLink, Eye } from 'lucide-react';

const AI_REQUESTS = [
  { id: 'REQ-001', url: 'https://amazon.com/producto-ejemplo-1', user: 'María López', marketplace: 'Amazon', status: 'Pendiente', date: '2025-05-28' },
  { id: 'REQ-002', url: 'https://aliexpress.com/item-ejemplo-2', user: 'Pedro González', marketplace: 'AliExpress', status: 'Revisado', date: '2025-05-27' },
  { id: 'REQ-003', url: 'https://mercadolibre.com/item-ejemplo-3', user: 'Lucía Ramírez', marketplace: 'Mercado Libre', status: 'Cotizado', date: '2025-05-26' },
  { id: 'REQ-004', url: 'https://amazon.com/producto-ejemplo-4', user: 'Carlos Mendoza', marketplace: 'Amazon', status: 'Pendiente', date: '2025-05-25' },
  { id: 'REQ-005', url: 'https://aliexpress.com/item-ejemplo-5', user: 'Ana García', marketplace: 'AliExpress', status: 'Revisado', date: '2025-05-24' },
];

const statusBadge = (status: string) => {
  const variants: Record<string, 'warning' | 'success' | 'secondary' | 'default'> = {
    Pendiente: 'warning',
    Revisado: 'secondary',
    Cotizado: 'success',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

export default function AdminAIRequests() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitudes IA</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de productos por enlace</p>
      </div>

      <Card>
        <CardContent className="p-0">
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
                {AI_REQUESTS.map((req) => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{req.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={req.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
                      >
                        {req.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{req.user}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{req.marketplace}</td>
                    <td className="px-4 py-3">{statusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cnFormat(req.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
