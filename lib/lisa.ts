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
