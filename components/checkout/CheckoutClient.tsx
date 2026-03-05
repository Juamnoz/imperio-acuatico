'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, getFirstImage } from '@/lib/utils'
import { SHIPPING_OPTIONS } from '@/lib/types'
import { Truck, Store, MapPin, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const schema = z.object({
  customerName: z.string().min(2, 'Nombre requerido'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(7, 'Teléfono requerido'),
  customerCity: z.string().min(2, 'Ciudad requerida'),
  customerAddress: z.string().min(5, 'Dirección requerida'),
  customerId: z.string().optional(),
  shippingMethod: z.enum(['tienda', 'domicilio', 'interrapidisimo']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const shippingIcons = { tienda: Store, domicilio: MapPin, interrapidisimo: Truck }

export function CheckoutClient() {
  const { items, getSubtotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subtotal = getSubtotal()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { shippingMethod: 'tienda' },
  })

  const selectedShipping = watch('shippingMethod')
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping)?.price ?? 0
  const total = subtotal + shippingCost

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Crear orden
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      if (!orderRes.ok) throw new Error('Error al crear la orden')
      const order = await orderRes.json()

      // 2. Crear preferencia Mercado Pago
      const mpRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!mpRes.ok) throw new Error('Error al iniciar el pago')
      const { initPoint, sandboxInitPoint } = await mpRes.json()

      clearCart()
      // Redirect a Mercado Pago
      window.location.href = sandboxInitPoint ?? initPoint
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-6xl mb-4">🐠</p>
        <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6">Agrega algunos productos antes de finalizar la compra.</p>
        <Link href="/tienda" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos personales */}
        <fieldset className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Datos personales</legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre completo *</label>
              <input
                {...register('customerName')}
                placeholder="Helen Natalia Villada"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {errors.customerName && <p className="mt-1 text-xs text-destructive">{errors.customerName.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Cédula (opcional)</label>
              <input
                {...register('customerId')}
                placeholder="1234567890"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email *</label>
              <input
                {...register('customerEmail')}
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {errors.customerEmail && <p className="mt-1 text-xs text-destructive">{errors.customerEmail.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Teléfono / WhatsApp *</label>
              <input
                {...register('customerPhone')}
                placeholder="3027471832"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {errors.customerPhone && <p className="mt-1 text-xs text-destructive">{errors.customerPhone.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ciudad *</label>
              <input
                {...register('customerCity')}
                placeholder="Caldas, Antioquia"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {errors.customerCity && <p className="mt-1 text-xs text-destructive">{errors.customerCity.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Dirección *</label>
              <input
                {...register('customerAddress')}
                placeholder="Cra 48 #127sur-78"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {errors.customerAddress && <p className="mt-1 text-xs text-destructive">{errors.customerAddress.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Notas adicionales</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Instrucciones especiales para el envío..."
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </fieldset>

        {/* Método de envío */}
        <fieldset className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Método de entrega</legend>

          {SHIPPING_OPTIONS.map((opt) => {
            const Icon = shippingIcons[opt.id as keyof typeof shippingIcons]
            const isSelected = selectedShipping === opt.id
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
              >
                <input type="radio" {...register('shippingMethod')} value={opt.id} className="mt-0.5 accent-primary" />
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="font-semibold text-sm text-primary">
                      {opt.price === 0 ? 'Gratis' : formatPrice(opt.price)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  {opt.estimatedDays && (
                    <p className="text-xs text-muted-foreground">{opt.estimatedDays}</p>
                  )}
                </div>
              </label>
            )
          })}
        </fieldset>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>Pagar con Mercado Pago — {formatPrice(total)}</>
          )}
        </button>
      </form>

      {/* Order summary */}
      <div className="space-y-4">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Resumen del pedido</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image || '/images/placeholder-fish.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p>✓ Pago seguro con Mercado Pago</p>
            <p>✓ No se aceptan pagos contra entrega</p>
            <p>✓ Mínimo {formatPrice(60000)} para envíos nacionales</p>
          </div>
        </div>
      </div>
    </div>
  )
}
