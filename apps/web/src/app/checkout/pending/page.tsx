'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutPending() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-6">
        <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Pago Pendiente</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Estamos esperando la confirmación del pago. Te notificaremos cuando se haya procesado.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline" size="lg">
          <Link href="/products">Seguir Comprando</Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/orders">Ver mis pedidos</Link>
        </Button>
      </div>
    </div>
  );
}
