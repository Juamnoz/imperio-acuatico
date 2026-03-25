import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get admin-specific email logs
    const emails = await db.emailLog.findMany({
      where: { type: 'admin_notification' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get related orders for context
    const orderIds = emails
      .map((e) => e.orderId)
      .filter((id): id is string => id !== null)

    const orders = await db.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerCity: true,
        total: true,
        status: true,
        items: { select: { name: true, quantity: true, price: true } },
        createdAt: true,
      },
    })

    const orderMap = new Map(orders.map((o) => [o.id, o]))

    const notifications = emails.map((email) => {
      const order = email.orderId ? orderMap.get(email.orderId) : null
      return {
        id: email.id,
        subject: email.subject,
        status: email.status,
        errorMessage: email.errorMessage ?? null,
        resendId: email.resendId,
        createdAt: email.createdAt.toISOString(),
        orderId: email.orderId,
        order: order
          ? {
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              customerCity: order.customerCity,
              total: order.total,
              status: order.status,
              items: order.items,
              createdAt: order.createdAt.toISOString(),
            }
          : null,
      }
    })

    // Stats
    const totalAdmin = emails.length
    const sent = emails.filter((e) => e.status === 'sent').length
    const failed = emails.filter((e) => e.status === 'failed').length

    return NextResponse.json({ notifications, stats: { total: totalAdmin, sent, failed } })
  } catch (error) {
    console.error('Admin correo API error:', error)
    return NextResponse.json({ error: 'Error fetching admin emails' }, { status: 500 })
  }
}
