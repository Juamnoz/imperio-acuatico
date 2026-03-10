const ALEGRA_API = 'https://api.alegra.com/api/v1'
const ALEGRA_EMAIL = process.env.ALEGRA_EMAIL!
const ALEGRA_TOKEN = process.env.ALEGRA_TOKEN!

function headers() {
  const auth = Buffer.from(`${ALEGRA_EMAIL}:${ALEGRA_TOKEN}`).toString('base64')
  return {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  }
}

async function alegraFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ALEGRA_API}${path}`, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Alegra API error ${res.status}: ${body}`)
  }
  return res.json()
}

// ── Tipos ──

export interface AlegraItem {
  id: string
  name: string
  description: string | null
  reference: string | null
  status: string
  price: { price: number; currency: { code: string } }[]
  inventory?: {
    availableQuantity: number
    unit: string
  }
  itemCategory?: {
    id: number
    name: string
  } | null
}

export interface AlegraCategory {
  id: string
  name: string
  status: string
}

export interface AlegraContact {
  id: string
  name: string[]
  email: string
}

export interface AlegraInvoice {
  id: string
  numberTemplate?: { fullNumber: string }
}

// ── Productos ──

export async function getAllItems(): Promise<AlegraItem[]> {
  const all: AlegraItem[] = []
  let start = 0
  const limit = 30
  while (true) {
    const batch = await alegraFetch<AlegraItem[]>(
      `/items?start=${start}&limit=${limit}`
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < limit) break
    start += limit
  }
  return all
}

// ── Categorías ──

export async function getAllCategories(): Promise<AlegraCategory[]> {
  const all: AlegraCategory[] = []
  let start = 0
  const limit = 30
  while (true) {
    const batch = await alegraFetch<AlegraCategory[]>(
      `/item-categories?start=${start}&limit=${limit}`
    )
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < limit) break
    start += limit
  }
  return all
}

// ── Contactos ──

export async function findOrCreateContact(data: {
  name: string
  email: string
  phone: string
  address: string
  city: string
}): Promise<AlegraContact> {
  // Buscar por email
  const existing = await alegraFetch<AlegraContact[]>(
    `/contacts?email=${encodeURIComponent(data.email)}`
  )
  if (Array.isArray(existing) && existing.length > 0) {
    return existing[0]
  }

  // Crear nuevo
  const nameParts = data.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  return alegraFetch<AlegraContact>('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      name: [firstName, lastName],
      email: data.email,
      phonePrimary: data.phone,
      address: { address: data.address, city: data.city },
      type: ['client'],
    }),
  })
}

// ── Facturas ──

export async function createInvoice(params: {
  contactId: string
  items: { alegraItemId: string; name: string; price: number; quantity: number }[]
  observations?: string
}): Promise<AlegraInvoice> {
  const invoiceItems = params.items.map((item) => ({
    id: item.alegraItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  return alegraFetch<AlegraInvoice>('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      client: { id: params.contactId },
      items: invoiceItems,
      observations: params.observations || 'Venta desde Imperio Acuático Web',
      status: 'open',
    }),
  })
}
