import {
  Body,
  Container,
  Column,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

const LOGO_URL = 'https://www.imperioacuatico.com/logo-teal.png'

// -- Palette --
const bg = '#091215'
const cardBg = '#0d1f23'
const glassBg = '#112a2f'
const glassBorder = 'rgba(13,115,119,0.25)'
const primary = '#0D7377'
const primaryLight = '#14b8bc'
const textMain = '#e8f4f4'
const textMuted = '#7da3a3'
const textDim = '#4a7070'
const divider = '#1a3a3d'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Props {
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
  type?: 'customer' | 'admin'
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

export default function OrderConfirmationEmail(props: Props) {
  const {
    orderId = 'test-12345678',
    customerName = 'Cliente',
    customerEmail = '',
    customerPhone = '',
    customerCity = '',
    customerAddress = '',
    items = [],
    subtotal = 0,
    shipping = 0,
    shippingMethod = null,
    total = 0,
    type = 'customer',
  } = props

  const orderRef = `#${orderId.slice(-8).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://www.imperioacuatico.com'
  const isAdmin = type === 'admin'

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {isAdmin
          ? `Nueva venta ${formatCOP(total)} - ${customerName}`
          : `Pedido confirmado ${orderRef} - Imperio Acuatico`}
      </Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* ── Header with gradient ── */}
          <Section style={{
            background: `linear-gradient(135deg, ${primary} 0%, #0a5558 100%)`,
            padding: '36px 32px 28px',
            textAlign: 'center' as const,
            borderRadius: '0 0 16px 16px',
          }}>
            <Img src={LOGO_URL} alt="Imperio Acuatico" width="72" height="72" style={{ display: 'block', margin: '0 auto 14px', borderRadius: '16px' }} />
            <Text style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Imperio Acuatico
            </Text>
            <Text style={{ margin: '6px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' as const }}>
              Peces Ornamentales & Accesorios
            </Text>
          </Section>

          {/* ── Glass card container ── */}
          <Section style={{ padding: '24px 16px 32px' }}>

            {/* ── Status badge ── */}
            <Section style={{
              backgroundColor: glassBg,
              border: `1px solid ${glassBorder}`,
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center' as const,
              marginBottom: '16px',
            }}>
              {isAdmin ? (
                <>
                  <Text style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(13,115,119,0.2)',
                    color: primaryLight,
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase' as const,
                    margin: '0 0 12px',
                  }}>
                    NUEVA VENTA
                  </Text>
                  <Text style={{ margin: '0 0 4px', fontSize: '42px', fontWeight: 800, color: primaryLight }}>
                    {formatCOP(total)}
                  </Text>
                  <Text style={{ margin: 0, fontSize: '14px', color: textMuted }}>
                    Pedido {orderRef} · {items.length} producto{items.length > 1 ? 's' : ''}
                  </Text>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'inline-block',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${primary}, ${primaryLight})`,
                    lineHeight: '52px',
                    fontSize: '24px',
                    color: '#fff',
                    textAlign: 'center' as const,
                  }}>
                    ✓
                  </div>
                  <Text style={{ margin: '16px 0 6px', fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
                    ¡Pago confirmado!
                  </Text>
                  <Text style={{ margin: 0, fontSize: '14px', color: textMuted }}>
                    Hola {customerName}, tu pedido ha sido procesado exitosamente.
                  </Text>
                </>
              )}
            </Section>

            {/* ── Order info glass card ── */}
            <Section style={{
              backgroundColor: glassBg,
              border: `1px solid ${glassBorder}`,
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px',
            }}>
              <Text style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 700, color: textDim, textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
                {isAdmin ? 'Datos del cliente' : 'Detalles del pedido'}
              </Text>

              {isAdmin && (
                <>
                  <Row style={{ marginBottom: '4px' }}>
                    <Column style={{ width: '90px' }}><Text style={labelStyle}>Nombre:</Text></Column>
                    <Column><Text style={{ ...valueStyle, fontWeight: 600 }}>{customerName}</Text></Column>
                  </Row>
                  <Row style={{ marginBottom: '4px' }}>
                    <Column style={{ width: '90px' }}><Text style={labelStyle}>Email:</Text></Column>
                    <Column><Text style={valueStyle}><Link href={`mailto:${customerEmail}`} style={{ color: primaryLight, textDecoration: 'none' }}>{customerEmail}</Link></Text></Column>
                  </Row>
                  <Row style={{ marginBottom: '4px' }}>
                    <Column style={{ width: '90px' }}><Text style={labelStyle}>Telefono:</Text></Column>
                    <Column><Text style={valueStyle}><Link href={`https://wa.me/57${customerPhone}`} style={{ color: primaryLight, textDecoration: 'none' }}>{customerPhone}</Link></Text></Column>
                  </Row>
                </>
              )}

              <Row style={{ marginBottom: '4px' }}>
                <Column style={{ width: '90px' }}><Text style={labelStyle}>Pedido:</Text></Column>
                <Column><Text style={{ ...valueStyle, fontWeight: 700 }}>{orderRef}</Text></Column>
              </Row>
              <Row style={{ marginBottom: '4px' }}>
                <Column style={{ width: '90px' }}><Text style={labelStyle}>Envio:</Text></Column>
                <Column><Text style={valueStyle}>{shippingLabel(shippingMethod)}</Text></Column>
              </Row>
              <Row>
                <Column style={{ width: '90px' }}><Text style={labelStyle}>Direccion:</Text></Column>
                <Column><Text style={valueStyle}>{customerAddress}, {customerCity}</Text></Column>
              </Row>
            </Section>

            {/* ── Products glass card ── */}
            <Section style={{
              backgroundColor: glassBg,
              border: `1px solid ${glassBorder}`,
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px',
            }}>
              <Text style={{ margin: '0 0 16px', fontSize: '10px', fontWeight: 700, color: textDim, textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
                Resumen del pedido
              </Text>

              {/* Column headers */}
              <Row style={{ borderBottom: `2px solid ${divider}`, paddingBottom: '8px', marginBottom: '4px' }}>
                <Column style={{ width: '55%' }}><Text style={thStyle}>Producto</Text></Column>
                <Column style={{ width: '15%', textAlign: 'center' as const }}><Text style={thStyle}>Cant.</Text></Column>
                <Column style={{ width: '30%', textAlign: 'right' as const }}><Text style={thStyle}>Total</Text></Column>
              </Row>

              {/* Items */}
              {items.map((item, i) => (
                <Row key={i} style={{ borderBottom: `1px solid ${divider}` }}>
                  <Column style={{ width: '55%' }}><Text style={tdStyle}>{item.name}</Text></Column>
                  <Column style={{ width: '15%', textAlign: 'center' as const }}><Text style={{ ...tdStyle, color: textMuted }}>{item.quantity}</Text></Column>
                  <Column style={{ width: '30%', textAlign: 'right' as const }}><Text style={{ ...tdStyle, fontWeight: 600 }}>{formatCOP(item.price * item.quantity)}</Text></Column>
                </Row>
              ))}

              {/* Totals */}
              <Hr style={{ borderColor: divider, margin: '12px 0 8px' }} />
              <Row>
                <Column><Text style={{ ...labelStyle, fontSize: '13px' }}>Subtotal</Text></Column>
                <Column style={{ textAlign: 'right' as const }}><Text style={{ ...valueStyle, fontSize: '13px' }}>{formatCOP(subtotal)}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={{ ...labelStyle, fontSize: '13px' }}>Envio</Text></Column>
                <Column style={{ textAlign: 'right' as const }}><Text style={{ ...valueStyle, fontSize: '13px' }}>{shipping === 0 ? 'Gratis' : formatCOP(shipping)}</Text></Column>
              </Row>
              <Hr style={{ borderColor: divider, margin: '8px 0' }} />
              <Row>
                <Column><Text style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>Total</Text></Column>
                <Column style={{ textAlign: 'right' as const }}><Text style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: primaryLight }}>{formatCOP(total)}</Text></Column>
              </Row>
            </Section>

            {/* ── CTA Button ── */}
            <Section style={{ textAlign: 'center' as const, padding: '8px 0 0' }}>
              <Link
                href={isAdmin
                  ? `${baseUrl}/admin/pedidos`
                  : `https://wa.me/573027471832?text=Hola!%20Mi%20pedido%20es%20${encodeURIComponent(orderRef)}`
                }
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${primary}, #0a9a9e)`,
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '14px 36px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                {isAdmin ? 'Ver pedido en el panel' : 'Contactar por WhatsApp'}
              </Link>
              {!isAdmin && (
                <Text style={{ margin: '12px 0 0', fontSize: '12px', color: textDim }}>
                  ¿Dudas sobre tu pedido? Escribenos y te ayudamos.
                </Text>
              )}
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={{ padding: '0 32px 32px', textAlign: 'center' as const }}>
            <Hr style={{ borderColor: divider, margin: '0 0 20px' }} />
            <Text style={{ margin: 0, fontSize: '12px', color: textDim }}>
              Imperio Acuatico — Caldas, Antioquia
            </Text>
            <Text style={{ margin: '4px 0 0', fontSize: '11px', color: '#2d4a4a' }}>
              Todos los peces pre-desparasitados · WhatsApp 302 747 1832
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// -- Shared styles --
const labelStyle = { margin: 0, fontSize: '12px', color: textMuted, padding: '3px 0' }
const valueStyle = { margin: 0, fontSize: '12px', color: textMain, padding: '3px 0' }
const thStyle = { margin: 0, fontSize: '10px', fontWeight: 700 as const, color: textDim, textTransform: 'uppercase' as const, letterSpacing: '1px', padding: '0 0 8px' }
const tdStyle = { margin: 0, fontSize: '13px', color: textMain, padding: '10px 0' }
