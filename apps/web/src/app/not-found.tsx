import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        La página que buscas no existe o ha sido movida. Verifica la URL o vuelve al inicio.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="h-5 w-5 mr-2" />
          Volver al Inicio
        </Link>
      </Button>
    </div>
  );
}
