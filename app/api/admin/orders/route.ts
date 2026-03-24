import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SHIPPING_PRICES: Record<string, number> = {
  tienda: 0,
  domicilio: 20000,
  nacional: 20000,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, customerCity, customerAddress, shippingMethod, items, status, source } = body

    if (!customerName || !customerEmail || !customerPhone || !customerCity) {
      return NextResponse.json({ error: 'Datos del cliente requeridos' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Agrega al menos un producto' }, { status: 400 })
    }

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const shipping = SHIPPING_PRICES[shippingMethod] ?? 0

    // Find or create customer
    let customer = await db.customer.findUnique({ where: { email: customerEmail.toLowerCase() } })
    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail.toLowerCase(),
          phone: customerPhone,
          city: customerCity,
          address: customerAddress || '',
        },
      })
    }

    const order = await db.order.create({
      data: {
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        customerPhone,
        customerCity,
        customerAddress: customerAddress || '',
        customerId: customer.id,
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: status || 'PENDING',
        source: source || 'direct',
        shippingMethod: shippingMethod || null,
        items: {
          create: items.map((i: { productId: string; name: string; price: number; quantity: number }) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const search = searchParams.get('q')

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ]
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, trackingNumber, items } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const data: any = {}
    if (status) data.status = status
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber

    // If items are provided, replace all items and recalculate totals
    if (items && Array.isArray(items)) {
      await db.orderItem.deleteMany({ where: { orderId } })
      await db.orderItem.createMany({
        data: items.map((i: { productId: string; name: string; price: number; quantity: number }) => ({
          orderId,
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      })
      const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
      const existing = await db.order.findUnique({ where: { id: orderId }, select: { shipping: true } })
      data.subtotal = subtotal
      data.total = subtotal + (existing?.shipping ?? 0)
    }

    const order = await db.order.update({
      where: { id: orderId },
      data,
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    // Delete order items first, then the order
    await db.orderItem.deleteMany({ where: { orderId } })
    await db.order.delete({ where: { id: orderId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin order delete error:', error)
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 })
  }
}
