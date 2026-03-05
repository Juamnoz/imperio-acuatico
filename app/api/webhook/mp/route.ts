import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type === 'payment' && data?.id) {
      const baseUrl = 'https://api.mercadopago.com'
      const response = await fetch(`${baseUrl}/v1/payments/${data.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      })

      if (response.ok) {
        const payment = await response.json()
        const orderId = payment.external_reference

        if (orderId) {
          const statusMap: Record<string, string> = {
            approved: 'PAID',
            rejected: 'CANCELLED',
            pending: 'PENDING',
            in_process: 'PENDING',
          }

          await db.order.update({
            where: { id: orderId },
            data: {
              mpPaymentId: String(data.id),
              mpStatus: payment.status,
              status: statusMap[payment.status] ?? 'PENDING',
            },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook MP error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
