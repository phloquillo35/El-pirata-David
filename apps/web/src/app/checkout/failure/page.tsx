'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutFailure() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6">
        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Pago Rechazado</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        El pago no pudo ser procesado. Podés intentar con otro medio de pago o contactarnos para ayudarte.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline" size="lg">
          <Link href="/checkout">Intentar de nuevo</Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/products">Ver productos</Link>
        </Button>
      </div>
    </div>
  );
}
