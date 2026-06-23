'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Check, ChevronLeft, ChevronRight, CreditCard, Landmark, Truck, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { api } from '@/lib/api';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
}

type PaymentMethod = 'mercado_pago' | 'bank_transfer';

const STEPS = [
  { id: 1, label: 'Dirección', icon: Truck },
  { id: 2, label: 'Pago', icon: CreditCard },
  { id: 3, label: 'Revisar', icon: Package },
  { id: 4, label: 'Confirmación', icon: Check },
];

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const { cart, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>({ street: '', city: '', state: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const shipping = subtotal >= 500000 ? 0 : 15000;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const canContinueAddress = address.street.length >= 3 && address.city.length >= 2 && address.state.length >= 2;

  const handlePlaceOrder = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const addressPayload = {
        alias: 'Envío',
        fullName: `${user!.name} ${user!.lastName}`,
        phone: user!.phone || '+5490000000000',
        street: address.street,
        number: '',
        city: address.city,
        state: address.state,
        country: 'AR',
      };

      const createdAddress = await api.post<{ id: string }>('/addresses', addressPayload);

      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const order = await api.post<any>('/orders', {
        items: orderItems,
        shippingAddressId: createdAddress.id,
      });

      if (paymentMethod === 'mercado_pago') {
        const preference = await api.post<{ initPoint: string }>(
          `/payments/mercado-pago/create/${order.id}`
        );
        window.location.href = preference.initPoint;
        return;
      }

      await clearCart();
      setOrderNumber(order.orderNumber);
      setCurrentStep(4);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el pedido';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Inicia sesión para continuar</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Necesitás estar registrado para poder realizar tu compra. Iniciá sesión o creá una cuenta.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/auth/register">Crear Cuenta</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 4 && orderNumber) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Pedido Confirmado!</h1>
        <p className="text-muted-foreground mb-2">
          Tu pedido fue registrado exitosamente.
        </p>
        <p className="text-lg font-semibold text-primary mb-8">
          Número de pedido: {orderNumber}
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md">
          Te enviaremos un correo electrónico con los detalles de tu pedido y el seguimiento del envío.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Seguir Comprando
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/orders">
              Ver mis pedidos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex items-center justify-center mb-10">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  currentStep >= step.id ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-px w-12 sm:w-20 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Calle y número</label>
                  <Input
                    placeholder="Av. Mariscal López 1234"
                    value={address.street}
                    onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ciudad</label>
                    <Input
                      placeholder="Buenos Aires"
                      value={address.city}
                      onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Departamento</label>
                    <Input
                      placeholder="Central"
                      value={address.state}
                      onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/cart">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Volver al Carrito
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canContinueAddress}
                  >
                    Continuar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'mercado_pago'
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setPaymentMethod('mercado_pago')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mercado_pago"
                    checked={paymentMethod === 'mercado_pago'}
                    onChange={() => setPaymentMethod('mercado_pago')}
                    className="accent-primary"
                  />
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Mercado Pago</p>
                    <p className="text-sm text-muted-foreground">
                      Pagá con tarjeta de crédito, débito o efectivo
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="accent-primary"
                  />
                  <Landmark className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Transferencia Bancaria</p>
                    <p className="text-sm text-muted-foreground">
                      Transferí desde tu banco a nuestra cuenta
                    </p>
                  </div>
                </label>
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Atrás
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!paymentMethod}
                  >
                    Continuar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Revisar Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Dirección de Envío
                  </h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="font-medium">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Método de Pago
                  </h3>
                  <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
                    {paymentMethod === 'mercado_pago' ? (
                      <>
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span>Mercado Pago</span>
                      </>
                    ) : (
                      <>
                        <Landmark className="h-5 w-5 text-primary" />
                        <span>Transferencia Bancaria</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Productos
                  </h3>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay productos en tu carrito.</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>
                            {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Atrás
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isSubmitting || items.length === 0}>
                    {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Resumen del Pedido</h2>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Carrito vacío</p>
                  ) : (
                    items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate pr-2">
                          {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">GRATIS</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impuestos (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
