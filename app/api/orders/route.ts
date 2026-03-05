import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  customerCity: z.string().min(2),
  customerAddress: z.string().min(5),
  customerId: z.string().optional(),
  shippingMethod: z.enum(['tienda', 'domicilio', 'interrapidisimo']),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().positive().int(),
    })
  ).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    const subtotal = data.items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const shipping = data.shippingMethod === 'interrapidisimo' ? 11000 : 0
    const total = subtotal + shipping

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('POST /api/orders error:', error)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }
}
