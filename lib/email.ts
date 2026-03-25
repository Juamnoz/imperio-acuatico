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

/** Read admin email from SiteSettings, fallback to env, fallback to hardcoded */
export async function getAdminEmail(): Promise<string> {
  try {
    const row = await db.siteSettings.findUnique({ where: { key: 'admin_email' } })
    if (row?.value) return row.value
  } catch { /* ignore */ }
  return process.env.ADMIN_EMAIL ?? 'natyjaramillo81@gmail.com'
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const from = process.env.EMAIL_FROM ?? 'Imperio Acuático <pedidos@imperioacuatico.com>'
  const adminEmail = await getAdminEmail()

  try {
    const [customerHtml, adminHtml] = await Promise.all([
      render(OrderConfirmationEmail({ ...data, type: 'customer' })),
      render(OrderConfirmationEmail({ ...data, type: 'admin' })),
    ])

    // Send emails independently so one failure doesn't block the other
    const customerResult = await resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()} — Imperio Acuático`,
      html: customerHtml,
    })

    const adminResult = await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Nueva venta ${formatCOP(data.total)} — ${data.customerName}`,
      html: adminHtml,
    })

    // Log with detailed error messages
    const customerError = customerResult.error
      ? `${customerResult.error.name}: ${customerResult.error.message}`
      : null
    const adminError = adminResult.error
      ? `${adminResult.error.name}: ${adminResult.error.message}`
      : null

    if (customerError) console.error('Customer email error:', customerError)
    if (adminError) console.error('Admin email error:', adminError)

    await Promise.all([
      db.emailLog.create({
        data: {
          to: data.customerEmail,
          subject: `¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()}`,
          type: 'order_confirmation',
          orderId: data.orderId,
          resendId: customerResult.data?.id ?? null,
          status: customerResult.data ? 'sent' : 'failed',
          errorMessage: customerError,
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
          errorMessage: adminError,
        },
      }),
    ]).catch((err) => console.error('Email log error:', err))

    console.log('Emails sent:', {
      customer: { id: customerResult.data?.id, error: customerError },
      admin: { id: adminResult.data?.id, error: adminError },
    })
    return { success: true, customerResult, adminResult }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

/** Send a test email to verify the configuration works */
export async function sendTestEmail(toEmail: string) {
  const from = process.env.EMAIL_FROM ?? 'Imperio Acuático <pedidos@imperioacuatico.com>'

  const testData = {
    orderId: 'test-00000000',
    customerName: 'Email de Prueba',
    customerEmail: toEmail,
    customerPhone: '3027471832',
    customerCity: 'Caldas, Antioquia',
    customerAddress: 'Dirección de prueba',
    items: [
      { name: 'Betta Halfmoon (prueba)', quantity: 1, price: 25000 },
      { name: 'Guppy Cobra (prueba)', quantity: 3, price: 8000 },
    ],
    subtotal: 49000,
    shipping: 0,
    shippingMethod: 'tienda' as const,
    total: 49000,
    type: 'admin' as const,
  }

  try {
    const html = await render(OrderConfirmationEmail(testData))

    const result = await resend.emails.send({
      from,
      to: toEmail,
      subject: `[PRUEBA] Nueva venta $49.000 — Email de Prueba`,
      html,
    })

    const error = result.error
      ? `${result.error.name}: ${result.error.message}`
      : null

    await db.emailLog.create({
      data: {
        to: toEmail,
        subject: '[PRUEBA] Nueva venta $49.000 — Email de Prueba',
        type: 'admin_notification',
        resendId: result.data?.id ?? null,
        status: result.data ? 'sent' : 'failed',
        errorMessage: error,
      },
    }).catch(() => {})

    return {
      success: !!result.data,
      resendId: result.data?.id ?? null,
      error,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, resendId: null, error: msg }
  }
}
