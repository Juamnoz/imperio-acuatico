import { db } from '@/lib/db'

export async function getLisaConfig() {
  const rows = await db.siteSettings.findMany({
    where: { key: { in: ['lisa_sync_key', 'lisa_api_url', 'lisa_agent_id'] } },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const rawApiUrl = map['lisa_api_url'] || process.env.LISA_API_URL || 'http://localhost:3001'
  return {
    syncKey: map['lisa_sync_key'] || process.env.LISA_SYNC_KEY || '',
    apiUrl: rawApiUrl.replace(/\/v1\/?$/, ''),
    agentId: map['lisa_agent_id'] || process.env.LISA_AGENT_ID || '',
  }
}

export async function notifyLisa(order: any) {
  const { syncKey, apiUrl, agentId } = await getLisaConfig()
  if (!agentId || !syncKey) return
  await fetch(`${apiUrl}/v1/webhooks/store/${agentId}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-lisa-sync-key': syncKey },
    body: JSON.stringify({
      externalId: order.id,
      clientName: order.customerName,
      clientPhone: order.customerPhone,
      clientEmail: order.customerEmail,
      clientCity: order.customerCity,
      clientAddress: order.customerAddress,
      items: order.items.map((i: any) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        productId: i.productId,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status.toLowerCase(),
      notes: order.notes,
    }),
  })
}

export async function notifyLisaPayment(order: {
  id: string
  mpPaymentId: string | null
  mpStatus: string | null
  status: string
}) {
  const { syncKey, apiUrl, agentId } = await getLisaConfig()
  if (!agentId || !syncKey) return
  await fetch(`${apiUrl}/v1/webhooks/store/${agentId}/payment-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-lisa-sync-key': syncKey },
    body: JSON.stringify({
      externalId: order.id,
      mpPaymentId: order.mpPaymentId,
      mpStatus: order.mpStatus,
      status: order.status, // PAID | CANCELLED | PENDING (uppercase, LISA mapea)
    }),
  })
}

export async function notifyLisaOrderStatus(order: {
  id: string
  lisaOrderId?: string | null
  status: string
  trackingNumber?: string | null
}) {
  const { syncKey, apiUrl, agentId } = await getLisaConfig()
  if (!agentId || !syncKey) return
  // If the order has a lisaOrderId, update status in LISA via the orders endpoint
  // Use the payment-update endpoint which already handles status mapping
  await fetch(`${apiUrl}/v1/webhooks/store/${agentId}/payment-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-lisa-sync-key': syncKey },
    body: JSON.stringify({
      externalId: order.id,
      status: order.status, // PAID | CANCELLED | PENDING etc.
    }),
  })
}

export async function notifyLisaProduct(product: any) {
  const { syncKey, apiUrl, agentId } = await getLisaConfig()
  if (!apiUrl || !agentId || !syncKey) return

  let imageUrl: string | null = null
  try {
    const imgs = JSON.parse(product.images || '[]')
    imageUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
  } catch {}
  if (imageUrl && !imageUrl.startsWith('http')) {
    const siteUrl = process.env.NEXT_PUBLIC_URL || ''
    imageUrl = siteUrl ? `${siteUrl}${imageUrl}` : null
  }

  await fetch(`${apiUrl}/v1/webhooks/store/${agentId}/sync/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-lisa-sync-key': syncKey },
    body: JSON.stringify({
      agentId,
      externalId: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      isActive: product.available,
      description: product.description ?? null,
      imageUrl,
    }),
  })
}
