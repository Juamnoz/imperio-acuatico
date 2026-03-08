import { Suspense } from 'react'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import type { ProductWithCategory } from '@/lib/types'

interface FilterParams {
  categoria?: string
  q?: string
  featured?: string
  temperamento?: string
  cuidado?: string
  precio_min?: string
  precio_max?: string
  orden?: string
}

async function getProducts(params: FilterParams): Promise<ProductWithCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { available: true }

  if (params.categoria) where.category = { slug: params.categoria }
  if (params.featured === 'true') where.featured = true
  if (params.temperamento) where.temperament = params.temperamento
  if (params.cuidado) where.careLevel = params.cuidado
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
    ]
  }
  if (params.precio_min || params.precio_max) {
    const priceFilter: Record<string, number> = {}
    if (params.precio_min) priceFilter.gte = Number(params.precio_min)
    if (params.precio_max) priceFilter.lte = Number(params.precio_max)
    where.price = priceFilter
  }

  // Sort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: Record<string, string>[] = [{ featured: 'desc' }, { name: 'asc' }]
  switch (params.orden) {
    case 'price_asc':
      orderBy = [{ price: 'asc' }]
      break
    case 'price_desc':
      orderBy = [{ price: 'desc' }]
      break
    case 'name_asc':
      orderBy = [{ name: 'asc' }]
      break
    case 'newest':
      orderBy = [{ createdAt: 'desc' }]
      break
  }

  return db.product.findMany({
    where,
    include: { category: true },
    orderBy,
  }) as Promise<ProductWithCategory[]>
}

async function getCategories() {
  return db.category.findMany({ orderBy: { order: 'asc' } })
}

interface TiendaPageProps {
  searchParams: Promise<FilterParams>
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const activeCategory = categories.find((c) => c.slug === params.categoria)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground">
          {activeCategory ? activeCategory.name : 'Catálogo Completo'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} {products.length === 1 ? 'producto' : 'productos'} disponibles
        </p>
      </div>

      <Suspense fallback={null}>
        <CatalogFilters categories={categories}>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/50 py-20 text-center">
              <p className="text-4xl mb-4">🐠</p>
              <p className="text-muted-foreground">No hay productos con esos filtros.</p>
              <a href="/tienda" className="mt-4 inline-block text-sm text-primary hover:underline">
                Limpiar filtros
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </CatalogFilters>
      </Suspense>
    </div>
  )
}
