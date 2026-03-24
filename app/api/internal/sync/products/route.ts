import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function authorized(req: NextRequest) {
  const header = req.headers.get('x-lisa-sync-key')
  if (!header) return false
  const row = await db.siteSettings.findUnique({ where: { key: 'lisa_sync_key' } })
  const key = row?.value || process.env.LISA_SYNC_KEY || ''
  return key !== '' && header === key
}

// GET — LISA descarga el catálogo completo para reconciliación
export async function GET(req: NextRequest) {
  if (!await authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(
    products.map((p) => {
      let imageUrl: string | null = null
      try {
        const imgs = JSON.parse(p.images || '[]')
        imageUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
      } catch {}
      if (imageUrl && !imageUrl.startsWith('http')) {
        const siteUrl = process.env.NEXT_PUBLIC_URL || ''
        imageUrl = siteUrl ? `${siteUrl}${imageUrl}` : null
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        available: p.available,
        description: p.description ?? null,
        imageUrl,
        categorySlug: p.category?.slug ?? null,
      }
    })
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// POST — LISA notifica cambio de producto (crear, actualizar o eliminar)
export async function POST(req: NextRequest) {
  if (!await authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { action, externalId, lisaProductId, price, stock, isActive, name, description, imageUrl } = body

  // ── DELETE ──
  if (action === 'delete') {
    if (externalId) {
      const product = await db.product.findUnique({ where: { id: externalId } })
      if (product) {
        await db.product.update({ where: { id: externalId }, data: { available: false } })
        return NextResponse.json({ ok: true, action: 'soft-deleted' })
      }
    }
    return NextResponse.json({ ok: true, action: 'not-found' })
  }

  // ── UPSERT ──
  // Try to find existing product by externalId (Imperio product ID)
  let product = externalId
    ? await db.product.findUnique({ where: { id: externalId } })
    : null

  if (product) {
    // Update existing product
    const updated = await db.product.update({
      where: { id: externalId },
      data: {
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(isActive !== undefined && { available: isActive }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    })
    return NextResponse.json(updated)
  }

  // Product not found by externalId — create new if we have enough data
  if (name) {
    // Find a default category
    const defaultCategory = await db.category.findFirst({ orderBy: { order: 'asc' } })
    if (!defaultCategory) {
      return NextResponse.json({ error: 'No hay categorías configuradas' }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = slugify(name)
    if (!baseSlug) baseSlug = 'producto'
    let slug = baseSlug
    let suffix = 2
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`
      suffix++
    }

    const created = await db.product.create({
      data: {
        name,
        slug,
        price: price ?? 0,
        stock: stock ?? 0,
        available: isActive ?? true,
        description: description ?? null,
        categoryId: defaultCategory.id,
        images: imageUrl ? JSON.stringify([imageUrl]) : '[]',
      },
      include: { category: true },
    })
    return NextResponse.json(created, { status: 201 })
  }

  return NextResponse.json({ error: 'Datos insuficientes para crear producto' }, { status: 400 })
}
