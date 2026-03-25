import { Resend } from 'resend'
import { db } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const LOGO_URL = 'https://www.imperioacuatico.com/logo-teal.png'

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

function shippingLabel(method: string | null) {
  switch (method) {
    case 'tienda': return 'Recoge en tienda (Caldas, Antioquia)'
    case 'domicilio': return 'Domicilio Medellín'
    case 'interrapidisimo': return 'Interrapidísimo (nacional)'
    default: return method ?? 'No especificado'
  }
}

function buildItemsHtml(items: OrderItem[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #1a3a3d; font-size: 14px; color: #e0f0f0;">
          ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #1a3a3d; font-size: 14px; color: #9cb8b8; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #1a3a3d; font-size: 14px; color: #e0f0f0; text-align: right; font-weight: 600;">
          ${formatCOP(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('')
}

function customerConfirmationHtml(data: OrderEmailData) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0a1a1d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d2428;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0D7377 0%, #0a5558 100%); padding: 32px; text-align: center;">
      <img src="${LOGO_URL}" alt="Imperio Acuático" width="80" height="80" style="display: block; margin: 0 auto 12px;" />
      <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
        Imperio Acuático
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.7); letter-spacing: 1px; text-transform: uppercase;">
        Peces Ornamentales & Accesorios
      </p>
    </div>

    <!-- Success Banner -->
    <div style="padding: 32px; text-align: center; border-bottom: 1px solid #1a3a3d;">
      <div style="display: inline-block; background-color: #0D7377; width: 56px; height: 56px; border-radius: 50%; line-height: 56px; font-size: 28px;">
        ✓
      </div>
      <h2 style="margin: 16px 0 8px; font-size: 22px; color: #ffffff; font-weight: 700;">
        ¡Pago confirmado!
      </h2>
      <p style="margin: 0; font-size: 14px; color: #9cb8b8;">
        Hola ${data.customerName}, tu pedido ha sido procesado exitosamente.
      </p>
    </div>

    <!-- Order Info -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #1a3a3d;">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="padding: 4px 0; color: #6b9090;">Pedido:</td>
          <td style="padding: 4px 0; color: #e0f0f0; text-align: right; font-weight: 600;">#${data.orderId.slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b9090;">Envío:</td>
          <td style="padding: 4px 0; color: #e0f0f0; text-align: right;">${shippingLabel(data.shippingMethod)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b9090;">Dirección:</td>
          <td style="padding: 4px 0; color: #e0f0f0; text-align: right;">${data.customerAddress}, ${data.customerCity}</td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <div style="padding: 24px 32px;">
      <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; color: #6b9090; text-transform: uppercase; letter-spacing: 1.5px;">
        Resumen del pedido
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: left; text-transform: uppercase; letter-spacing: 1px;">Producto</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Cant.</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: right; text-transform: uppercase; letter-spacing: 1px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsHtml(data.items)}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #6b9090;">Subtotal</td>
          <td style="padding: 4px 0; font-size: 14px; color: #e0f0f0; text-align: right;">${formatCOP(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #6b9090;">Envío</td>
          <td style="padding: 4px 0; font-size: 14px; color: #e0f0f0; text-align: right;">${data.shipping === 0 ? 'Gratis' : formatCOP(data.shipping)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ffffff; border-top: 2px solid #1a3a3d;">Total</td>
          <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #0D7377; text-align: right; border-top: 2px solid #1a3a3d;">${formatCOP(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- WhatsApp CTA -->
    <div style="padding: 0 32px 32px; text-align: center;">
      <a href="https://wa.me/573027471832?text=Hola!%20Mi%20pedido%20es%20%23${data.orderId.slice(-8).toUpperCase()}"
         style="display: inline-block; background-color: #0D7377; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;">
        Contactar por WhatsApp
      </a>
      <p style="margin: 12px 0 0; font-size: 12px; color: #6b9090;">
        ¿Dudas sobre tu pedido? Escríbenos y te ayudamos.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #091618; padding: 24px 32px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #4a7070;">
        Imperio Acuático — Caldas, Antioquia
      </p>
      <p style="margin: 4px 0 0; font-size: 11px; color: #3a5858;">
        Todos los peces pre-desparasitados · WhatsApp 302 747 1832
      </p>
    </div>

  </div>
</body>
</html>`
}

function adminNotificationHtml(data: OrderEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3003'
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0a1a1d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d2428;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0D7377 0%, #0a5558 100%); padding: 24px 32px;">
      <table style="width: 100%;">
        <tr>
          <td style="vertical-align: middle;">
            <img src="${LOGO_URL}" alt="Imperio Acuático" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 12px;" />
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; display: inline-block; vertical-align: middle;">
              Imperio Acuático
            </h1>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
              NUEVA VENTA
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Sale Amount -->
    <div style="padding: 32px; text-align: center; border-bottom: 1px solid #1a3a3d;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #6b9090; text-transform: uppercase; letter-spacing: 1px;">Venta total</p>
      <p style="margin: 0; font-size: 36px; font-weight: 800; color: #0D7377;">${formatCOP(data.total)}</p>
      <p style="margin: 8px 0 0; font-size: 13px; color: #9cb8b8;">
        Pedido #${data.orderId.slice(-8).toUpperCase()} · ${data.items.length} producto${data.items.length > 1 ? 's' : ''}
      </p>
    </div>

    <!-- Customer Info -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #1a3a3d;">
      <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; color: #6b9090; text-transform: uppercase; letter-spacing: 1.5px;">
        Datos del cliente
      </p>
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #6b9090; width: 100px;">Nombre:</td>
          <td style="padding: 6px 0; color: #e0f0f0; font-weight: 600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b9090;">Email:</td>
          <td style="padding: 6px 0; color: #e0f0f0;">
            <a href="mailto:${data.customerEmail}" style="color: #0D7377; text-decoration: none;">${data.customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b9090;">Teléfono:</td>
          <td style="padding: 6px 0; color: #e0f0f0;">
            <a href="https://wa.me/57${data.customerPhone}" style="color: #0D7377; text-decoration: none;">${data.customerPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b9090;">Ciudad:</td>
          <td style="padding: 6px 0; color: #e0f0f0;">${data.customerCity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b9090;">Dirección:</td>
          <td style="padding: 6px 0; color: #e0f0f0;">${data.customerAddress}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b9090;">Envío:</td>
          <td style="padding: 6px 0; color: #e0f0f0;">${shippingLabel(data.shippingMethod)}</td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <div style="padding: 24px 32px;">
      <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; color: #6b9090; text-transform: uppercase; letter-spacing: 1.5px;">
        Productos
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: left; text-transform: uppercase;">Producto</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: center; text-transform: uppercase;">Cant.</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #1a3a3d; font-size: 11px; color: #6b9090; text-align: right; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsHtml(data.items)}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #6b9090;">Subtotal</td>
          <td style="padding: 4px 0; font-size: 14px; color: #e0f0f0; text-align: right;">${formatCOP(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #6b9090;">Envío</td>
          <td style="padding: 4px 0; font-size: 14px; color: #e0f0f0; text-align: right;">${data.shipping === 0 ? 'Gratis' : formatCOP(data.shipping)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ffffff; border-top: 2px solid #1a3a3d;">Total</td>
          <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #0D7377; text-align: right; border-top: 2px solid #1a3a3d;">${formatCOP(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Admin CTA -->
    <div style="padding: 0 32px 32px; text-align: center;">
      <a href="${baseUrl}/admin/pedidos"
         style="display: inline-block; background-color: #0D7377; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;">
        Ver pedido en el panel
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #091618; padding: 20px 32px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #3a5858;">
        Notificación automática · Imperio Acuático Admin
      </p>
    </div>

  </div>
</body>
</html>`
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const from = process.env.EMAIL_FROM ?? 'Imperio Acuático <pedidos@imperioacuatico.com>'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'natyjaramillo81@gmail.com'

  try {
    // Send both emails in parallel
    const [customerResult, adminResult] = await Promise.all([
      // Email to customer
      resend.emails.send({
        from,
        to: data.customerEmail,
        subject: `¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()} — Imperio Acuático`,
        html: customerConfirmationHtml(data),
      }),
      // Email to admin
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `Nueva venta ${formatCOP(data.total)} — ${data.customerName}`,
        html: adminNotificationHtml(data),
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
