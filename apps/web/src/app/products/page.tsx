'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, PackageOpen, SlidersHorizontal, Search, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/mock-products';

const ITEMS_PER_PAGE = 9;
const SORT_OPTIONS = [
  { value: '', label: 'Ordenar' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
  { value: 'newest', label: 'Nuevos primero' },
] as const;

function ProductImage({ product }: { product: MockProduct }) {
  const [imageError, setImageError] = useState(false);

  if (product.image && !imageError) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <ImageOff className="h-6 w-6 text-foreground/[0.06]" />
      <span className="text-8xl font-bold text-foreground/[0.04] select-none tracking-tighter">
        {product.name.charAt(0)}
      </span>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] bg-secondary/50 rounded-2xl" />
      <div className="space-y-2 px-1">
        <div className="h-3 w-16 bg-secondary/50 rounded" />
        <div className="h-4 w-3/4 bg-secondary/50 rounded" />
        <div className="h-5 w-1/3 bg-secondary/50 rounded" />
      </div>
    </div>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categoryId');

  const [allProducts, setAllProducts] = useState<MockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/products`);
        if (!res.ok) throw new Error('Error al cargar productos');
        const data = await res.json();
        const list = data.products ?? data.data ?? data;
        setAllProducts(Array.isArray(list) ? list : []);
      } catch {
        setAllProducts(MOCK_PRODUCTS);
        setError('No se pudieron cargar los productos desde el servidor.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (categoryParam) {
      result = result.filter(
        (p) => p.categoryId === categoryParam || p.category.toLowerCase() === categoryParam.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name, 'es'));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [allProducts, sortBy, categoryParam, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (isLoading) {
    return (
      <div className="container mx-auto pt-32 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-32 pb-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            {categoryParam
              ? allProducts.find((p) => p.categoryId === categoryParam)?.category || 'Productos'
              : 'Productos'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 pl-8 pr-3 rounded-lg border border-input bg-transparent text-xs appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative mb-10 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 text-sm"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 mb-10 p-4 rounded-xl bg-secondary/50">
          <p className="text-sm text-muted-foreground flex-1">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Reintentar
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
              <PackageOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-lg font-medium mb-2">No se encontraron productos</h2>
          <p className="text-sm text-muted-foreground">Intenta con otros filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {paginatedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <div className="aspect-[4/5] rounded-2xl bg-secondary/50 overflow-hidden mb-4">
                  <ProductImage product={product} />
                </div>
                <div className="px-1 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="text-sm font-medium leading-snug group-hover:opacity-60 transition-opacity">
                    {product.name}
                  </h3>
                  <p className="text-base font-semibold tracking-tight">
                    {formatPrice(product.price)}
                  </p>
                  {product.stock === 0 ? (
                    <p className="text-xs text-muted-foreground/50">Sin stock</p>
                  ) : product.stock <= 5 ? (
                    <p className="text-xs text-muted-foreground">Quedan {product.stock} un.</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-16">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-xs transition-colors ${
                    page === currentPage
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto pt-32 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
