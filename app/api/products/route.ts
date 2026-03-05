import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const products = await db.product.findMany({
      where: {
        available: true,
        ...(categoria && { category: { slug: categoria } }),
        ...(featured && { featured: true }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
