import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createHash } from 'crypto'

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  customerCity: z.string().min(2),
  customerAddress: z.string().min(5),
  customerId: z.string().optional(),
  shippingMethod: z.enum(['tienda', 'domicilio', 'interrapidisimo']),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().positive().int(),
    })
  ).min(1),
})

function generateIdempotencyKey(email: string, items: { productId: string; quantity: number }[]): string {
  const payload = email + '|' + items.map(i => `${i.productId}:${i.quantity}`).sort().join(',')
  return createHash('sha256').update(payload).digest('hex').slice(0, 32)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    const subtotal = data.items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const shipping = data.shippingMethod === 'interrapidisimo' ? 11000 : 0
    const total = subtotal + shipping

    // Idempotencia: buscar orden PENDING reciente con el mismo key
    const idempotencyKey = data.idempotencyKey ||
      generateIdempotencyKey(data.customerEmail, data.items)

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingOrder = await db.order.findFirst({
      where: {
        idempotencyKey,
        status: 'PENDING',
        createdAt: { gte: fiveMinutesAgo },
      },
      include: { items: true },
    })

    if (existingOrder) {
      return NextResponse.json(existingOrder, { status: 200 })
    }

    const order = await db.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerCity: data.customerCity,
        customerAddress: data.customerAddress,
        customerId: data.customerId,
        shippingMethod: data.shippingMethod,
        notes: data.notes,
        subtotal,
        shipping,
        total,
        status: 'PENDING',
        idempotencyKey,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('POST /api/orders error:', error?.message ?? error, error?.code ?? '')
    return NextResponse.json({
      error: 'Error al crear la orden',
      detail: error?.message ?? String(error),
    }, { status: 500 })
  }
}
