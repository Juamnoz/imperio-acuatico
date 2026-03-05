import { CheckoutClient } from '@/components/checkout/CheckoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Finalizar compra' }

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Finalizar compra</h1>
      <CheckoutClient />
    </div>
  )
}
