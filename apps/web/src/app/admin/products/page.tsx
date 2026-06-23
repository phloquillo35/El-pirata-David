'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { Search, Plus, Pencil, Trash2, Package, X } from 'lucide-react';
import type { IProduct, PaginationMeta } from '@el-pirata-david/shared';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  price: string;
  stock: string;
  description: string;
  brand: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  minStock: string;
}

interface ProductRow extends IProduct {
  category?: { name: string };
}

const EMPTY_FORM: ProductFormData = {
  name: '', sku: '', price: '', stock: '0', description: '', brand: '',
  categoryId: '', isActive: true, isFeatured: false, minStock: '0',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await api.get<{ data: ProductRow[]; meta: PaginationMeta }>('/products', {
          search: debouncedSearch || undefined,
          page: 1,
          limit: 100,
          showInactive: 'true',
        });
        if (cancelled) return;
        setProducts(res.data);
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, retryKey]);

  // Open modal for create
  const openCreate = async () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setSaveError(null);
    try {
      const cats = await api.get<CategoryOption[]>('/categories');
      setCategories(Array.isArray(cats) ? cats : []);
    } catch { setCategories([]); }
    setShowModal(true);
  };

  // Open modal for edit
  const openEdit = async (product: ProductRow) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description || '',
      brand: product.brand || '',
      categoryId: product.categoryId || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      minStock: String(product.minStock ?? 0),
    });
    setSaveError(null);
    try {
      const cats = await api.get<CategoryOption[]>('/categories');
      setCategories(Array.isArray(cats) ? cats : []);
    } catch { setCategories([]); }
    setShowModal(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name || !formData.sku) {
      setSaveError('Nombre y SKU son obligatorios');
      return;
    }
    if (!formData.categoryId) {
      setSaveError('Categoría es obligatoria');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description || 'Sin descripción',
        brand: formData.brand || undefined,
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        minStock: Number(formData.minStock) || undefined,
      };

      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
        showToast('Producto actualizado');
      } else {
        await api.post('/products', payload);
        showToast('Producto creado');
      }
      setShowModal(false);
      setRetryKey(k => k + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setSaveError(msg);
      showToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deletingId}`);
      setDeletingId(null);
      showToast('Producto eliminado');
      setRetryKey(k => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar');
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Badge helper
  const statusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'success' : 'secondary'}>
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Table card with search */}
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
            <>
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
                    {products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category?.name || ''}</p>
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
                        <td className="px-4 py-3">{statusBadge(product.isActive)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingId(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron productos{search ? ` para "${search}"` : ''}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* --- MODAL: Create / Edit --- */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingId ? 'Editar Producto' : 'Agregar Producto'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {saveError && (
                  <div className="bg-destructive/15 text-destructive text-sm rounded-md p-3">{saveError}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Nombre *</label>
                    <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del producto" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU *</label>
                    <Input value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))} placeholder="Ej: PRD-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marca</label>
                    <Input value={formData.brand} onChange={e => setFormData(f => ({ ...f, brand: e.target.value }))} placeholder="Opcional" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" rows={2} placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio *</label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock *</label>
                    <Input type="number" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))} min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Mínimo</label>
                    <Input type="number" value={formData.minStock} onChange={e => setFormData(f => ({ ...f, minStock: e.target.value }))} min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría *</label>
                    <select value={formData.categoryId} onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Sin categoría</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300" />
                    Activo
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(f => ({ ...f, isFeatured: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300" />
                    Destacado
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Producto'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* --- MODAL: Confirm Delete --- */}
      {deletingId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeletingId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Eliminar Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDeletingId(null)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
