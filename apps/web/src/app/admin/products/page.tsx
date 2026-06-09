'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { Search, Plus, Pencil, Trash2, Package } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Smartphone XYZ Pro', sku: 'SPH-001', price: 2500000, stock: 15, status: 'Activo', category: 'Electrónica' },
  { id: '2', name: 'Laptop Pro 15"', sku: 'LPT-001', price: 8500000, stock: 5, status: 'Activo', category: 'Computación' },
  { id: '3', name: 'Auriculares Bluetooth', sku: 'AUR-005', price: 350000, stock: 30, status: 'Activo', category: 'Electrónica' },
  { id: '4', name: 'Smart TV 50" 4K', sku: 'TV-002', price: 5200000, stock: 8, status: 'Activo', category: 'Electrónica' },
  { id: '5', name: 'Mouse Inalámbrico', sku: 'MOU-003', price: 180000, stock: 25, status: 'Activo', category: 'Computación' },
  { id: '6', name: 'Tablet 10"', sku: 'TAB-001', price: 1800000, stock: 0, status: 'Inactivo', category: 'Computación' },
  { id: '7', name: 'Cámara Digital 4K', sku: 'CAM-003', price: 3200000, stock: 3, status: 'Activo', category: 'Electrónica' },
  { id: '8', name: 'Teclado Mecánico RGB', sku: 'TEC-002', price: 450000, stock: 12, status: 'Activo', category: 'Computación' },
];

export default function AdminProducts() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock === 0 ? 'text-destructive' : product.stock < 10 ? 'text-yellow-600' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.status === 'Activo' ? 'success' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron productos para &ldquo;{search}&rdquo;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
