import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get customers from Customer table
    const dbCustomers = await db.customer.findMany({
      include: {
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Also get "orphan" customers from orders not linked to a Customer record
    const orphanOrders = await db.order.findMany({
      where: { customerId: null },
      select: {
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerCity: true,
        customerAddress: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Aggregate orphan orders by email
    const orphanMap = new Map<string, {
      name: string; email: string; phone: string; city: string; address: string
      orders: number; totalSpent: number; lastOrder: string; paidOrders: number
    }>()

    for (const order of orphanOrders) {
      const key = order.customerEmail.toLowerCase()
      // Skip if this email already exists in the Customer table
      if (dbCustomers.some((c) => c.email.toLowerCase() === key)) continue
      const existing = orphanMap.get(key)
      if (existing) {
        existing.orders++
        existing.totalSpent += order.total
        if (order.status === 'PAID') existing.paidOrders++
      } else {
        orphanMap.set(key, {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          city: order.customerCity,
          address: order.customerAddress,
          orders: 1,
          totalSpent: order.total,
          lastOrder: order.createdAt.toISOString(),
          paidOrders: order.status === 'PAID' ? 1 : 0,
        })
      }
    }

    // Merge both sources
    const customers = [
      ...dbCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        address: c.address,
        notes: c.notes,
        orders: c.orders.length,
        totalSpent: c.orders.reduce((s, o) => s + o.total, 0),
        lastOrder: c.orders[0]?.createdAt.toISOString() ?? c.createdAt.toISOString(),
        paidOrders: c.orders.filter((o) => o.status === 'PAID').length,
        isRegistered: true,
      })),
      ...Array.from(orphanMap.values()).map((c) => ({
        ...c,
        id: null,
        address: c.address,
        notes: null,
        isRegistered: false,
      })),
    ].sort((a, b) => b.totalSpent - a.totalSpent)

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, city, address, notes } = body

    if (!name || !email || !phone || !city) {
      return NextResponse.json({ error: 'Nombre, email, teléfono y ciudad son requeridos' }, { status: 400 })
    }

    // Check if customer with this email already exists
    const existing = await db.customer.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un cliente con este email' }, { status: 409 })
    }

    const customer = await db.customer.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        city,
        address: address || '',
        notes: notes || null,
      },
    })

    // Link any existing orders with this email to the new customer
    await db.order.updateMany({
      where: { customerEmail: { equals: email, mode: 'insensitive' }, customerId: null },
      data: { customerId: customer.id },
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, city, address, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // If email changed, check uniqueness
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await db.customer.findUnique({ where: { email: email.toLowerCase() } })
      if (emailTaken) {
        return NextResponse.json({ error: 'Ya existe un cliente con este email' }, { status: 409 })
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({ error: 'Error updating customer' }, { status: 500 })
  }
}
