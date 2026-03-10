import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function startOf(period: 'day' | 'week' | 'month') {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (period === 'week') d.setDate(d.getDate() - d.getDay())
  if (period === 'month') d.setDate(1)
  return d
}

export async function GET() {
  try {
    const todayStart = startOf('day')
    const weekStart = startOf('week')
    const monthStart = startOf('month')

    const [
      totalProducts,
      availableProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalCategories,
      recentOrders,
      topProducts,
      // Time-based
      ordersToday,
      ordersWeek,
      ordersMonth,
      paidToday,
      paidWeek,
      paidMonth,
      // Last 30 days daily data
      last30DaysOrders,
      // Customers
      totalCustomers,
      emailsSent,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { available: true } }),
      db.order.count(),
      db.order.count({ where: { status: 'PAID' } }),
      db.order.count({ where: { status: 'PENDING' } }),
      db.category.count(),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { items: true },
      }),
      db.orderItem.groupBy({
        by: ['name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      // Time counts
      db.order.count({ where: { createdAt: { gte: todayStart } } }),
      db.order.count({ where: { createdAt: { gte: weekStart } } }),
      db.order.count({ where: { createdAt: { gte: monthStart } } }),
      db.order.findMany({ where: { status: 'PAID', createdAt: { gte: todayStart } }, select: { total: true } }),
      db.order.findMany({ where: { status: 'PAID', createdAt: { gte: weekStart } }, select: { total: true } }),
      db.order.findMany({ where: { status: 'PAID', createdAt: { gte: monthStart } }, select: { total: true } }),
      // Last 30 days
      db.order.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Unique customers
      db.order.findMany({ distinct: ['customerEmail'], select: { customerEmail: true } }),
      db.emailLog.count(),
    ])

    const sum = (arr: { total: number }[]) => arr.reduce((s, o) => s + o.total, 0)

    // Revenue from all paid orders
    const allPaid = await db.order.findMany({ where: { status: 'PAID' }, select: { total: true } })
    const totalRevenue = sum(allPaid)

    // Build daily chart data (last 30 days)
    const dailyMap: Record<string, { orders: number; revenue: number }> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = { orders: 0, revenue: 0 }
    }
    for (const o of last30DaysOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      if (dailyMap[key]) {
        dailyMap[key].orders++
        if (o.status === 'PAID') dailyMap[key].revenue += o.total
      }
    }
    const dailyChart = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      ...data,
    }))

    return NextResponse.json({
      products: { total: totalProducts, available: availableProducts },
      orders: { total: totalOrders, paid: paidOrders, pending: pendingOrders },
      categories: totalCategories,
      revenue: totalRevenue,
      recentOrders,
      topProducts,
      timeline: {
        today: { orders: ordersToday, revenue: sum(paidToday) },
        week: { orders: ordersWeek, revenue: sum(paidWeek) },
        month: { orders: ordersMonth, revenue: sum(paidMonth) },
      },
      dailyChart,
      totalCustomers: totalCustomers.length,
      emailsSent,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
