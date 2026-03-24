import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createItem as createAlegraItem } from '@/lib/alegra'
import { notifyLisaProduct } from '@/lib/lisa'

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data.name || !data.categoryId) {
      return NextResponse.json(
        { error: 'Nombre y categoría son requeridos' },
        { status: 400 }
      )
    }

    const price = parseInt(data.price) || 0
    const stock = parseInt(data.stock) || 0

    // 1. Crear en Alegra
    let alegraId: string | null = null
    try {
      // Buscar el alegraId de la categoría si existe
      const category = await db.category.findUnique({ where: { id: data.categoryId } })
      const alegraItem = await createAlegraItem({
        name: data.name,
        description: data.description || null,
        price,
        stock,
        categoryId: category?.alegraId || null,
      })
      alegraId = String(alegraItem.id)
    } catch (err) {
      console.error('Error creando en Alegra (continuando sin alegraId):', err)
    }

    // 2. Generar slug único
    let baseSlug = slugify(data.name)
    if (!baseSlug) baseSlug = 'producto'
    let slug = baseSlug
    let slugSuffix = 2
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugSuffix}`
      slugSuffix++
    }

    // 3. Crear en base de datos
    const product = await db.product.create({
      data: {
        alegraId,
        name: data.name,
        slug,
        description: data.description || null,
        price,
        stock,
        available: data.available ?? true,
        featured: data.featured ?? false,
        categoryId: data.categoryId,
        images: data.images || '[]',
        temperament: data.temperament || null,
        careLevel: data.careLevel || null,
        tankMin: data.tankMin ? parseInt(data.tankMin) : null,
        tags: data.tags || null,
        priceBulk: data.priceBulk || null,
      },
      include: { category: true },
    })

    // 4. Notificar a LISA
    await notifyLisaProduct(product).catch(() => {})

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Admin product create error:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
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

    // Notify LISA (awaited so Vercel doesn't kill the lambda before the fetch completes)
    await notifyLisaProduct(product).catch(() => {})

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin product update error:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId requerido' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Delete the product
    await db.product.delete({ where: { id: productId } })

    // Notify LISA to deactivate
    await notifyLisaProduct({ ...product, available: false }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin product delete error:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
