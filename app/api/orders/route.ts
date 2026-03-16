import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createHash } from 'crypto'

async function getLisaConfig() {
  const rows = await db.siteSettings.findMany({
    where: { key: { in: ['lisa_sync_key', 'lisa_api_url', 'lisa_agent_id'] } },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    syncKey: map['lisa_sync_key'] || process.env.LISA_SYNC_KEY || '',
    apiUrl: map['lisa_api_url'] || process.env.LISA_API_URL || 'http://localhost:3001',
    agentId: map['lisa_agent_id'] || process.env.LISA_AGENT_ID || '',
  }
}

async function notifyLisa(order: any) {
  const { syncKey, apiUrl, agentId } = await getLisaConfig()
  if (!agentId || !syncKey) return
  await fetch(`${apiUrl}/v1/webhooks/store/${agentId}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-lisa-sync-key': syncKey },
    body: JSON.stringify({
      externalId: order.id,
      clientName: order.customerName,
      clientPhone: order.customerPhone,
      clientEmail: order.customerEmail,
      clientCity: order.customerCity,
      clientAddress: order.customerAddress,
      items: order.items.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, productId: i.productId })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status.toLowerCase(),
      notes: order.notes,
    }),
  })
}

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  customerCity: z.string().min(2),
  customerAddress: z.string().min(5),
  customerId: z.string().optional(),
  shippingMethod: z.enum(['tienda', 'domicilio', 'nacional']),
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
    const shippingPrices: Record<string, number> = {
      tienda: 0,
      domicilio: 20000,
      nacional: 20000,
    }
    const shipping = shippingPrices[data.shippingMethod] ?? 0
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
        source: 'web',
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

    // Notificar a LISA (fire-and-forget)
    notifyLisa(order).catch(() => {})

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
