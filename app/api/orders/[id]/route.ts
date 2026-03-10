import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      total: true,
      status: true,
      items: { select: { productId: true, name: true, price: true, quantity: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(order)
}
