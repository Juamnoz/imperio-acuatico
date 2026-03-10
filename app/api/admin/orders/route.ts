import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    const { orderId, status, trackingNumber } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const data: any = {}
    if (status) data.status = status
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber

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
