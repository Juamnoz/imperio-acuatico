import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, toEmail } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const result = await sendOrderConfirmation({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: toEmail || order.customerEmail,
      customerPhone: order.customerPhone,
      customerCity: order.customerCity,
      customerAddress: order.customerAddress,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      shippingMethod: order.shippingMethod,
      total: order.total,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Error enviando email' }, { status: 500 })
  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json({ error: 'Error reenviando email' }, { status: 500 })
  }
}
