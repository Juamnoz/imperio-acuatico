import { Resend } from 'resend'
import { render } from '@react-email/components'
import { db } from '@/lib/db'
import OrderConfirmationEmail from '@/emails/order-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCity: string
  customerAddress: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  shippingMethod: string | null
  total: number
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n)
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const from = process.env.EMAIL_FROM ?? 'Imperio Acuático <pedidos@imperioacuatico.com>'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'natyjaramillo81@gmail.com'

  try {
    const [customerHtml, adminHtml] = await Promise.all([
      render(OrderConfirmationEmail({ ...data, type: 'customer' })),
      render(OrderConfirmationEmail({ ...data, type: 'admin' })),
    ])

    const [customerResult, adminResult] = await Promise.all([
      resend.emails.send({
        from,
        to: data.customerEmail,
        subject: `¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()} — Imperio Acuático`,
        html: customerHtml,
      }),
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `Nueva venta ${formatCOP(data.total)} — ${data.customerName}`,
        html: adminHtml,
      }),
    ])

    // Log emails to database
    await Promise.all([
      db.emailLog.create({
        data: {
          to: data.customerEmail,
          subject: `¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()}`,
          type: 'order_confirmation',
          orderId: data.orderId,
          resendId: customerResult.data?.id ?? null,
          status: customerResult.data ? 'sent' : 'failed',
        },
      }),
      db.emailLog.create({
        data: {
          to: adminEmail,
          subject: `Nueva venta ${formatCOP(data.total)} — ${data.customerName}`,
          type: 'admin_notification',
          orderId: data.orderId,
          resendId: adminResult.data?.id ?? null,
          status: adminResult.data ? 'sent' : 'failed',
        },
      }),
    ]).catch((err) => console.error('Email log error:', err))

    console.log('Emails sent:', { customer: customerResult, admin: adminResult })
    return { success: true, customerResult, adminResult }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
