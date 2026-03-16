import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const LISA_API = process.env.LISA_API_URL || ''
const LISA_AGENT_ID = process.env.LISA_AGENT_ID || ''

async function notifyLisaProduct(product: any) {
  const [syncKeyRow, apiUrlRow, agentIdRow] = await Promise.all([
    db.siteSettings.findUnique({ where: { key: 'lisa_sync_key' } }),
    db.siteSettings.findUnique({ where: { key: 'lisa_api_url' } }),
    db.siteSettings.findUnique({ where: { key: 'lisa_agent_id' } }),
  ])
  const syncKey = syncKeyRow?.value || ''
  const rawApiUrl = apiUrlRow?.value || LISA_API || ''
  const apiUrl = rawApiUrl.replace(/\/v1\/?$/, '')
  const agentId = agentIdRow?.value || LISA_AGENT_ID || ''
  if (!apiUrl || !agentId || !syncKey) return

  let imageUrl: string | null = null
  try {
    const imgs = JSON.parse(product.images || '[]')
    imageUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
  } catch {}

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '30')
    const search = searchParams.get('q')
    const categoryId = searchParams.get('category')
    const availability = searchParams.get('available')

    const hasImage = searchParams.get('hasImage')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { alegraId: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (availability === 'true') where.available = true
    if (availability === 'false') where.available = false
    if (hasImage === 'true') {
      where.images = { not: '[]' }
    } else if (hasImage === 'false') {
      where.images = '[]'
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error) {
    console.error('Admin products error:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { productId, ...data } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId requerido' }, { status: 400 })
    }

    const allowed: any = {}
    if (data.price !== undefined) allowed.price = data.price
    if (data.stock !== undefined) allowed.stock = data.stock
    if (data.available !== undefined) allowed.available = data.available
    if (data.featured !== undefined) allowed.featured = data.featured
    if (data.description !== undefined) allowed.description = data.description
    if (data.name !== undefined) allowed.name = data.name
    if (data.images !== undefined) allowed.images = data.images
    if (data.categoryId !== undefined) allowed.categoryId = data.categoryId
    if (data.tags !== undefined) allowed.tags = data.tags
    if (data.temperament !== undefined) allowed.temperament = data.temperament
    if (data.careLevel !== undefined) allowed.careLevel = data.careLevel
    if (data.tankMin !== undefined) allowed.tankMin = data.tankMin
    if (data.priceBulk !== undefined) allowed.priceBulk = data.priceBulk

    const product = await db.product.update({
      where: { id: productId },
      data: allowed,
      include: { category: true },
    })

    // Notify LISA fire-and-forget
    notifyLisaProduct(product).catch(() => {})

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin product update error:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}
