import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPreference } from '@/lib/mercadopago'
import type { CartItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const cartItems: CartItem[] = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: '',
      slug: '',
      quantity: item.quantity,
    }))

    const preference = await createPreference(order.id, cartItems, order.shipping)

    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    })

    // Read sandbox mode from env file dynamically
    let isSandbox = process.env.NEXT_PUBLIC_MP_SANDBOX === 'true'
    try {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      const envContent = await readFile(join(process.cwd(), '.env.local'), 'utf-8')
      const match = envContent.match(/^NEXT_PUBLIC_MP_SANDBOX=(.*)$/m)
      if (match) isSandbox = match[1].trim() === 'true'
    } catch {}

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      sandbox: isSandbox,
    })
  } catch (error: any) {
    console.error('POST /api/checkout error:', error?.message ?? error, error?.cause ?? '')
    return NextResponse.json({
      error: 'Error al crear preferencia de pago',
      detail: error?.message ?? String(error),
    }, { status: 500 })
  }
}
