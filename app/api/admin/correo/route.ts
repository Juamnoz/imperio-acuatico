import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminEmail, sendTestEmail } from '@/lib/email'

export async function GET() {
  try {
    const adminEmail = await getAdminEmail()

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

    const totalAdmin = emails.length
    const sent = emails.filter((e) => e.status === 'sent').length
    const failed = emails.filter((e) => e.status === 'failed').length

    return NextResponse.json({
      notifications,
      stats: { total: totalAdmin, sent, failed },
      adminEmail,
    })
  } catch (error) {
    console.error('Admin correo API error:', error)
    return NextResponse.json({ error: 'Error fetching admin emails' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { adminEmail } = body

    if (!adminEmail || !adminEmail.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    await db.siteSettings.upsert({
      where: { key: 'admin_email' },
      update: { value: adminEmail },
      create: { key: 'admin_email', value: adminEmail },
    })

    return NextResponse.json({ ok: true, adminEmail })
  } catch (error) {
    console.error('Admin email update error:', error)
    return NextResponse.json({ error: 'Error guardando email' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { toEmail } = body

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const result = await sendTestEmail(toEmail)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Error enviando email de prueba' }, { status: 500 })
  }
}
