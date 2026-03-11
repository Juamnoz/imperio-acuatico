import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findOrCreateContact, createInvoice } from '@/lib/alegra'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.alegraInvoiceId) {
      return NextResponse.json({
        message: 'Ya tiene factura en Alegra',
        alegraInvoiceId: order.alegraInvoiceId,
      })
    }

    // Buscar o crear contacto en Alegra
    const contact = await findOrCreateContact({
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      city: order.customerCity,
    })

    // Buscar alegraId de cada producto referenciado en los items
    const productIds = order.items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, alegraId: true },
    })
    const alegraMap = new Map(products.map((p) => [p.id, p.alegraId]))

    // Preparar items para la factura
    const invoiceItems = order.items.map((item) => ({
      alegraItemId: alegraMap.get(item.productId) ?? null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    // Verificar que todos los productos tengan alegraId
    const missingAlegra = invoiceItems.filter((i) => !i.alegraItemId)
    if (missingAlegra.length > 0) {
      return NextResponse.json(
        {
          error: 'Algunos productos no están vinculados a Alegra',
          missing: missingAlegra.map((i) => i.name),
        },
        { status: 400 }
      )
    }

    // Crear factura en Alegra
    const invoice = await createInvoice({
      contactId: contact.id,
      items: invoiceItems as { alegraItemId: string; name: string; price: number; quantity: number }[],
      observations: `Pedido web #${order.id}${order.notes ? ` — ${order.notes}` : ''}`,
    })

    // Guardar referencia en la orden
    await db.order.update({
      where: { id: order.id },
      data: { alegraInvoiceId: invoice.id },
    })

    return NextResponse.json({
      success: true,
      alegraInvoiceId: invoice.id,
      invoiceNumber: invoice.numberTemplate?.fullNumber,
    })
  } catch (error) {
    console.error('Alegra invoice error:', error)
    return NextResponse.json(
      { error: 'Error al crear factura en Alegra', details: String(error) },
      { status: 500 }
    )
  }
}
