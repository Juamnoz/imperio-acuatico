import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function authorized(req: NextRequest) {
  const header = req.headers.get('x-lisa-sync-key')
  if (!header) return false
  const row = await db.siteSettings.findUnique({ where: { key: 'lisa_sync_key' } })
  const key = row?.value || process.env.LISA_SYNC_KEY || ''
  return key !== '' && header === key
}

// POST — LISA envía una nueva orden (e.g., pedido de WhatsApp)
export async function POST(req: NextRequest) {
  if (!await authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const {
    lisaOrderId, clientName, clientPhone, clientEmail,
    clientCity, clientAddress, items, subtotal, shipping, total,
    status, channelSource, notes,
  } = body

  if (!clientName || !clientPhone) {
    return NextResponse.json({ error: 'clientName y clientPhone requeridos' }, { status: 400 })
  }

  // Idempotency: check if order already exists by lisaOrderId
  if (lisaOrderId) {
    const existing = await db.order.findUnique({ where: { lisaOrderId } })
    if (existing) return NextResponse.json(existing)
  }

  // Find or create customer
  const email = (clientEmail || `${clientPhone}@whatsapp.local`).toLowerCase()
  let customer = await db.customer.findUnique({ where: { email } })
  if (!customer) {
    customer = await db.customer.create({
      data: {
        name: clientName,
        email,
        phone: clientPhone,
        city: clientCity || '',
        address: clientAddress || '',
      },
    })
  }

  // Map items — try to resolve productId from item name
  const orderItems = Array.isArray(items)
    ? await Promise.all(items.map(async (i: any) => {
        let productId = i.productId || ''
        if (!productId && i.name) {
          const product = await db.product.findFirst({
            where: { name: { equals: i.name, mode: 'insensitive' } },
          })
          productId = product?.id || ''
        }
        return {
          productId,
          name: i.name || 'Producto',
          price: Number(i.price) || 0,
          quantity: Number(i.quantity) || 1,
        }
      }))
    : []

  const calcSubtotal = subtotal ?? orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const calcShipping = shipping ?? 0
  const calcTotal = total ?? calcSubtotal + calcShipping

  const statusMap: Record<string, string> = {
    pending: 'PENDING',
    paid: 'PAID',
    processing: 'PROCESSING',
    shipped: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  }

  const order = await db.order.create({
    data: {
      customerName: clientName,
      customerEmail: email,
      customerPhone: clientPhone,
      customerCity: clientCity || '',
      customerAddress: clientAddress || '',
      customerId: customer.id,
      subtotal: calcSubtotal,
      shipping: calcShipping,
      total: calcTotal,
      status: statusMap[status] || 'PENDING',
      source: channelSource === 'whatsapp' ? 'whatsapp' : 'direct',
      lisaOrderId: lisaOrderId || null,
      notes: notes || null,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  })

  return NextResponse.json(order, { status: 201 })
}

// PATCH — LISA notifica cambio de estado de orden
export async function PATCH(req: NextRequest) {
  if (!await authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { lisaOrderId, externalId, status, trackingNumber } = body

  // Find order by lisaOrderId or externalId (Imperio order ID)
  let order = lisaOrderId
    ? await db.order.findUnique({ where: { lisaOrderId } })
    : null
  if (!order && externalId) {
    order = await db.order.findUnique({ where: { id: externalId } })
  }
  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  const statusMap: Record<string, string> = {
    pending: 'PENDING',
    paid: 'PAID',
    processing: 'PROCESSING',
    shipped: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      ...(status && { status: statusMap[status] || status.toUpperCase() }),
      ...(trackingNumber !== undefined && { trackingNumber }),
    },
  })

  return NextResponse.json(updated)
}
