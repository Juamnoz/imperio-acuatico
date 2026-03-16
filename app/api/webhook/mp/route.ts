import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findOrCreateContact, createInvoice } from '@/lib/alegra'
import { sendOrderConfirmation } from '@/lib/email'
import { notifyLisaPayment } from '@/lib/lisa'

async function createAlegraInvoice(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order || order.alegraInvoiceId) return

    const contact = await findOrCreateContact({
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      city: order.customerCity,
    })

    // Buscar alegraId de cada producto
    const productIds = order.items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, alegraId: true },
    })
    const alegraMap = new Map(products.map((p) => [p.id, p.alegraId]))

    const invoiceItems = order.items
      .filter((item) => alegraMap.get(item.productId))
      .map((item) => ({
        alegraItemId: alegraMap.get(item.productId)!,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))

    if (invoiceItems.length === 0) return

    const invoice = await createInvoice({
      contactId: contact.id,
      items: invoiceItems,
      observations: `Pedido web #${order.id}`,
    })

    await db.order.update({
      where: { id: order.id },
      data: { alegraInvoiceId: invoice.id },
    })

    console.log(`Factura Alegra #${invoice.id} creada para orden ${orderId}`)
  } catch (error) {
    console.error('Error creando factura Alegra:', error)
  }
}

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

          const updatedOrder = await db.order.update({
            where: { id: orderId },
            data: {
              mpPaymentId: String(data.id),
              mpStatus: payment.status,
              status: statusMap[payment.status] ?? 'PENDING',
            },
          })

          // Notificar a LISA del nuevo estado de pago (fire-and-forget awaited)
          await notifyLisaPayment(updatedOrder).catch(() => {})

          // Cuando el pago es aprobado: emails + factura Alegra
          if (payment.status === 'approved') {
            const order = await db.order.findUnique({
              where: { id: orderId },
              include: { items: true },
            })

            if (order) {
              // Enviar emails de confirmación (cliente + admin)
              await sendOrderConfirmation({
                orderId: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                customerCity: order.customerCity,
                customerAddress: order.customerAddress,
                items: order.items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                })),
                subtotal: order.subtotal,
                shipping: order.shipping,
                shippingMethod: order.shippingMethod,
                total: order.total,
              })
            }

            // Crear factura en Alegra
            await createAlegraInvoice(orderId)
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook MP error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
