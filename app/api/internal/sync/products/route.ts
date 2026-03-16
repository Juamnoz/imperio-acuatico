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
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      available: p.available,
      categorySlug: p.category?.slug ?? null,
    }))
  )
}

// POST — LISA notifica cambio de producto (precio, stock, estado)
export async function POST(req: NextRequest) {
  if (!await authorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { externalId, price, stock, isActive, name } = body

  if (!externalId) {
    return NextResponse.json({ error: 'externalId requerido' }, { status: 400 })
  }

  const product = await db.product.findUnique({ where: { id: externalId } })
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const updated = await db.product.update({
    where: { id: externalId },
    data: {
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(isActive !== undefined && { available: isActive }),
      ...(name !== undefined && { name }),
    },
  })

  return NextResponse.json(updated)
}
