import { Resend } from 'resend'
import { db } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAXNSR0IArs4c6QAAAQplWElmTU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAA5AAAAcgE7AAIAAAAQAAAArIdpAAQAAAABAAAAvAAAAAAAAABgAAAAAQAAAGAAAAABQ2FudmEgZG9jPURBR1JuVWF1WXg0IHVzZXI9VUFFZXczeWI4VjQgYnJhbmQ9QkFFZXd6NGtDM1EAAEhlbGVuIEphcmFtaWxsbwAABpAAAAcAAAAEMDIxMJEBAAcAAAAEAQIDAKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAAeKADAAQAAAABAAAAeAAAAADhg+diAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGOmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTA4MDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkV4aWZWZXJzaW9uPjAyMTA8L2V4aWY6RXhpZlZlcnNpb24+CiAgICAgICAgIDxleGlmOkZsYXNoUGl4VmVyc2lvbj4wMTAwPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjEwODA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MTwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpPjI8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT4zPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwvZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSBkb2M9REFHUm5VYXVZeDQgdXNlcj1VQUVldzN5YjhWNCBicmFuZD1CQUVld3o0a0MzUTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj45NjwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+OTY8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDxkYzp0aXRsZT4KICAgICAgICAgICAgPHJkZjpBbHQ+CiAgICAgICAgICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+Z29ub3BvZGlvIC0gNTE8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QWx0PgogICAgICAgICA8L2RjOnRpdGxlPgogICAgICAgICA8ZGM6Y3JlYXRvcj4KICAgICAgICAgICAgPHJkZjpTZXE+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'

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
      <img src="${LOGO_BASE64}" alt="Imperio Acuático" width="80" height="80" style="display: block; margin: 0 auto 12px;" />
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
            <img src="${LOGO_BASE64}" alt="Imperio Acuático" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 12px;" />
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
  const from = process.env.EMAIL_FROM ?? 'Imperio Acuático <onboarding@resend.dev>'
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
