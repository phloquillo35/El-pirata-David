'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Globe, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft, RefreshCw, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cnFormat } from '@/lib/utils';

type RequestStatus = 'PENDING' | 'PROCESSING' | 'ANALYZED' | 'ALTERNATIVES_FOUND' | 'COMPLETED' | 'REJECTED' | 'FAILED';

interface Specification {
  name: string;
  value: string;
}

interface ProductInfo {
  name: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  image?: string;
  specifications: Specification[];
}

interface Alternative {
  id: string;
  name: string;
  price: number;
  supplier: string;
  confidence: number;
}

interface AiRequestDetail {
  id: string;
  url: string;
  notes: string;
  status: RequestStatus;
  marketplace: string;
  createdAt: string;
  product?: ProductInfo;
  alternatives: Alternative[];
  adminNotes?: string;
}

const STATUS_TIMELINE: { status: RequestStatus; label: string; icon: typeof Clock }[] = [
  { status: 'PENDING', label: 'En cola', icon: Clock },
  { status: 'PROCESSING', label: 'Analizando producto', icon: Loader2 },
  { status: 'ANALYZED', label: 'Producto analizado', icon: CheckCircle },
  { status: 'ALTERNATIVES_FOUND', label: 'Buscando alternativas', icon: CheckCircle },
  { status: 'COMPLETED', label: 'Completado', icon: CheckCircle },
];

const MOCK_DETAILS: Record<string, AiRequestDetail> = {
  'REQ-001': {
    id: 'REQ-001',
    url: 'https://www.mercadolibre.com.ar/smartphone-xyz-pro',
    notes: '',
    status: 'PENDING',
    marketplace: 'Mercado Libre',
    createdAt: '2026-05-28T10:30:00Z',
    alternatives: [],
  },
  'REQ-002': {
    id: 'REQ-002',
    url: 'https://www.amazon.com/dp/B0EXAMPLE',
    notes: 'Busco la version de 256GB',
    status: 'PROCESSING',
    marketplace: 'Amazon',
    createdAt: '2026-05-27T15:45:00Z',
    product: {
      name: 'Smartphone XYZ Pro',
      brand: 'XYZ',
      model: 'Pro Max',
      category: 'Electrónica',
      price: 2500000,
      specifications: [
        { name: 'Pantalla', value: '6.7" AMOLED' },
        { name: 'Procesador', value: 'Octa-core 2.8GHz' },
        { name: 'RAM', value: '8GB' },
        { name: 'Almacenamiento', value: '256GB' },
        { name: 'Cámara', value: '108MP' },
      ],
    },
    alternatives: [],
  },
  'REQ-003': {
    id: 'REQ-003',
    url: 'https://www.aliexpress.com/item/100500123456.html',
    notes: '',
    status: 'ALTERNATIVES_FOUND',
    marketplace: 'AliExpress',
    createdAt: '2026-05-25T09:00:00Z',
    product: {
      name: 'Auriculares Bluetooth Pro',
      brand: 'SoundWave',
      model: 'BT-700',
      category: 'Electrónica',
      price: 350000,
      specifications: [
        { name: 'Tipo', value: 'Over-ear' },
        { name: 'Conectividad', value: 'Bluetooth 5.3' },
        { name: 'Batería', value: '30 horas' },
        { name: 'Cancelación', value: 'Activa' },
      ],
    },
    alternatives: [
      { id: 'ALT-001', name: 'Auriculares SoundWave BT-700', price: 350000, supplier: 'Proveedor A (China)', confidence: 0.95 },
      { id: 'ALT-002', name: 'Headphones Inalámbricos QCY', price: 280000, supplier: 'Proveedor B (Vietnam)', confidence: 0.82 },
      { id: 'ALT-003', name: 'Auriculares Deportivos TWS', price: 190000, supplier: 'Proveedor C (Brasil)', confidence: 0.65 },
    ],
  },
  'REQ-004': {
    id: 'REQ-004',
    url: 'https://www.ebay.com/itm/123456789',
    notes: 'Necesito envio a Argentina',
    status: 'COMPLETED',
    marketplace: 'eBay',
    createdAt: '2026-05-20T14:20:00Z',
    product: {
      name: 'Laptop Pro 15"',
      brand: 'TechBrand',
      model: 'ProBook 15',
      category: 'Computación',
      price: 8500000,
      specifications: [
        { name: 'Pantalla', value: '15.6" Full HD' },
        { name: 'Procesador', value: 'Intel Core i7-1360P' },
        { name: 'RAM', value: '16GB DDR5' },
        { name: 'Almacenamiento', value: '512GB SSD' },
      ],
    },
    alternatives: [
      { id: 'ALT-004', name: 'Laptop TechBrand ProBook 15', price: 8500000, supplier: 'Distribuidor Oficial AR', confidence: 0.98 },
    ],
    adminNotes: 'Producto importado exitosamente. En tránsito hacia Argentina.',
  },
  'REQ-005': {
    id: 'REQ-005',
    url: 'https://www.mercadolibre.com.mx/producto-fallido',
    notes: '',
    status: 'FAILED',
    marketplace: 'Mercado Libre',
    createdAt: '2026-05-18T11:10:00Z',
    alternatives: [],
    adminNotes: 'El enlace proporcionado no corresponde a un producto válido. El vendedor eliminó la publicación.',
  },
};

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

export default function AiRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [isRetrying, setIsRetrying] = useState(false);

  const detail = MOCK_DETAILS[id];

  if (!detail) {
    return (
      <div className="text-center py-20">
        <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Solicitud no encontrada</h2>
        <p className="text-muted-foreground mb-6">La solicitud que buscas no existe o ha sido eliminada.</p>
        <Button asChild>
          <Link href="/ai-requests">Volver a mis solicitudes</Link>
        </Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_TIMELINE.findIndex((s) => s.status === detail.status);
  const isTerminalFailed = detail.status === 'FAILED' || detail.status === 'REJECTED';

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => setIsRetrying(false), 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/ai-requests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{detail.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">{cnFormat(detail.createdAt)}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(detail.status)} className="shrink-0 text-sm px-3 py-1">
            {getStatusLabel(detail.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Enlace Original
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={detail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {detail.url}
            </a>
            <div className="mt-3">
              <Badge variant="secondary">{detail.marketplace}</Badge>
            </div>
            {detail.notes && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Notas:</span>
                <p className="mt-0.5">{detail.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {detail.status === 'PENDING' && (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold mb-1">En cola para análisis</h3>
              <p className="text-sm text-muted-foreground">
                Tu solicitud está en la cola para ser procesada por nuestro sistema de IA.
                Te notificaremos cuando tengamos los resultados.
              </p>
            </CardContent>
          </Card>
        )}

        {isTerminalFailed && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
              <h3 className="text-lg font-semibold mb-1">Error al procesar la solicitud</h3>
              {detail.adminNotes && (
                <p className="text-sm text-muted-foreground mb-4">{detail.adminNotes}</p>
              )}
              <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!isTerminalFailed && detail.status !== 'PENDING' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Progreso del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {STATUS_TIMELINE.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className={`h-4 w-4 ${isCurrent && step.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                        </div>
                        {index < STATUS_TIMELINE.length - 1 && (
                          <div className={`w-px h-6 ${isCompleted && !isCurrent ? 'bg-primary' : 'bg-muted'}`} />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {detail.product && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{detail.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {detail.product.brand}{detail.product.model ? ` - ${detail.product.model}` : ''}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoría:</span>
                  <p className="font-medium">{detail.product.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio estimado:</span>
                  <p className="font-medium text-primary">{formatPrice(detail.product.price)}</p>
                </div>
              </div>
              {detail.product.specifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Especificaciones
                  </h4>
                  <div className="divide-y rounded-lg border">
                    {detail.product.specifications.map((spec, i) => (
                      <div key={i} className="flex py-2.5 px-3 text-sm">
                        <span className="w-1/3 text-muted-foreground">{spec.name}</span>
                        <span className="w-2/3 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {detail.alternatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PackageOpen className="h-4 w-4" />
                Alternativas Encontradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {detail.alternatives.map((alt) => (
                  <Card key={alt.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm">{alt.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{alt.supplier}</p>
                          <p className="text-primary font-bold mt-2">{formatPrice(alt.price)}</p>
                        </div>
                        <Button size="sm">Seleccionar</Button>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Confianza</span>
                          <span className="font-medium">{Math.round(alt.confidence * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${alt.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {detail.adminNotes && detail.status !== 'FAILED' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notas del Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{detail.adminNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
