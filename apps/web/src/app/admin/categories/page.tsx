'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags } from 'lucide-react';
export default function AdminCategories() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">Gestiona las categorías de tus productos</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />Próximamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestión de categorías estará disponible próximamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
