'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, PackageOpen, ArrowLeft, Truck, ShieldCheck, Headphones, Loader2, Check, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { api } from '@/lib/api';

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: { id: string; name: string; slug: string };
  categoryId: string;
  brand?: string;
  model?: string;
  stock: number;
  images: { url: string; alt?: string; order: number }[];
  specifications: { name: string; value: string }[];
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProduct() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await api.get<ProductDetail>(`/products/${slug}`);
        if (cancelled) return;
        setProduct(data);
        const similarRes = await api.get<{ data: ProductDetail[] }>('/products', {
          categoryId: data.categoryId,
          limit: 4,
        });
        if (cancelled) return;
        setSimilarProducts(
          similarRes.data.filter((p) => p.id !== data.id).slice(0, 3),
        );
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Error al cargar el producto');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadProduct();
    return () => { cancelled = true; };
  }, [slug, retryKey]);

  if (isLoading && !product) {
    return (
      <div className="container mx-auto pt-32 pb-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        </div>
        <h2 className="text-lg font-medium mb-2">Cargando producto...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto pt-32 pb-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
            <PackageOpen className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-medium mb-2">Error al cargar el producto</h2>
        <p className="text-sm text-muted-foreground mb-8">{fetchError}</p>
        <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)}>
          Reintentar
        </Button>
        <div className="mt-4">
          <Link href="/products">
            <Button variant="ghost">Ver todos los productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto pt-32 pb-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
            <PackageOpen className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-medium mb-2">Producto no encontrado</h2>
        <p className="text-sm text-muted-foreground mb-8">El producto que buscas no existe.</p>
        <Link href="/products">
          <Button variant="outline">Ver todos los productos</Button>
        </Link>
      </div>
    );
  }

  async function handleAddToCart() {
    setAddError(null);
    setIsAddingToCart(true);
    try {
      await addItem(product!.id, quantity);
      setAddSuccess(true);
      setQuantity(1);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al agregar al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="container mx-auto pt-32 pb-20">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a productos
      </Link>

      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <div className="aspect-square rounded-3xl bg-secondary/50 overflow-hidden">
          {product.images[0]?.url ? (
            <img
              src={product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-8 w-8 text-foreground/[0.06]" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {product.category.name}
            {product.brand ? ` / ${product.brand}` : ''}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mt-6">
            <p className="text-3xl md:text-4xl font-bold tracking-tight">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 ? (
              <span className="text-xs text-muted-foreground">
                {product.stock <= 5 ? `Quedan ${product.stock} un.` : 'En stock'}
              </span>
            ) : (
              <span className="text-xs text-destructive/70">Sin stock</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-input rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={product.stock === 0 || isAddingToCart}
                className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-50 rounded-l-full"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-4 text-sm font-medium tabular-nums border-x border-input py-2.5">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={product.stock === 0 || isAddingToCart}
                className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-50 rounded-r-full"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              size="lg"
              disabled={product.stock === 0 || isAddingToCart}
              onClick={handleAddToCart}
              className="flex-1 h-11 rounded-full text-sm"
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : addSuccess ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {isAddingToCart ? 'Agregando...' : addSuccess ? 'Agregado' : product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </Button>
          </div>

          {addError && (
            <p className="text-xs text-destructive/80 mt-3">{addError}</p>
          )}

          {product.stock === 0 && !addError && (
            <p className="text-xs text-muted-foreground mt-3">
              Este producto está agotado. Consultá por alternativas similares.
            </p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3 w-3" />
              Envío a toda Argentina
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Pago seguro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="h-3 w-3" />
              Atención personalizada
            </span>
          </div>
        </div>
      </div>

      {product.specifications.length > 0 && (
        <section className="mt-20 md:mt-32 max-w-2xl">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Especificaciones
          </h2>
          <div className="space-y-0">
            {product.specifications.map((spec, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between py-3 border-b border-border/50"
              >
                <span className="text-sm text-muted-foreground">{spec.name}</span>
                <span className="text-sm font-medium text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {similarProducts.length > 0 && (
        <section className="mt-20 md:mt-32">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-10">
            Productos similares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {similarProducts.map((sp) => (
              <Link key={sp.id} href={`/products/${sp.slug}`} className="group">
                <div className="aspect-[4/5] rounded-2xl bg-secondary/50 overflow-hidden mb-4">
                  {sp.images[0]?.url ? (
                    <img
                      src={sp.images[0]?.url}
                      alt={sp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-foreground/[0.04] select-none tracking-tighter">
                        {sp.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-1 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{sp.category.name}</p>
                  <p className="text-sm font-medium group-hover:opacity-60 transition-opacity">{sp.name}</p>
                  <p className="text-sm font-semibold tracking-tight">{formatPrice(sp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
