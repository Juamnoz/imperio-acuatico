import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get unique customers from orders with their stats
    const orders = await db.order.findMany({
      select: {
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerCity: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Aggregate by email
    const customerMap = new Map<string, {
      name: string
      email: string
      phone: string
      city: string
      orders: number
      totalSpent: number
      lastOrder: string
      paidOrders: number
    }>()

    for (const order of orders) {
      const key = order.customerEmail.toLowerCase()
      const existing = customerMap.get(key)
      if (existing) {
        existing.orders++
        existing.totalSpent += order.total
        if (order.status === 'PAID') existing.paidOrders++
      } else {
        customerMap.set(key, {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          city: order.customerCity,
          orders: 1,
          totalSpent: order.total,
          lastOrder: order.createdAt.toISOString(),
          paidOrders: order.status === 'PAID' ? 1 : 0,
        })
      }
    }

    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)

    // Get email logs
    const emails = await db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ customers, emails })
  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 })
  }
}
