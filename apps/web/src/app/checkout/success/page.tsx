'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccess() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
        <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Tu pago fue procesado correctamente. Podés ver el estado de tu pedido en la sección de pedidos.
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
