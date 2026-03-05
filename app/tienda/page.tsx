import { Suspense } from 'react'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { ProductWithCategory } from '@/lib/types'

async function getProducts(params: {
  categoria?: string
  q?: string
  featured?: string
}): Promise<ProductWithCategory[]> {
  return db.product.findMany({
    where: {
      available: true,
      ...(params.categoria && { category: { slug: params.categoria } }),
      ...(params.featured === 'true' && { featured: true }),
      ...(params.q && {
        OR: [
          { name: { contains: params.q } },
          { description: { contains: params.q } },
        ],
      }),
    },
    include: { category: true },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  }) as Promise<ProductWithCategory[]>
}

async function getCategories() {
  return db.category.findMany({ orderBy: { order: 'asc' } })
}

interface TiendaPageProps {
  searchParams: Promise<{ categoria?: string; q?: string; featured?: string }>
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const activeCategory = categories.find((c) => c.slug === params.categoria)

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground">
          {activeCategory ? activeCategory.name : 'Catálogo Completo'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} {products.length === 1 ? 'producto' : 'productos'} disponibles
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtros */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorías</p>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/tienda"
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${!params.categoria ? 'bg-primary/15 font-medium text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    Todos
                  </a>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/tienda?categoria=${cat.slug}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${params.categoria === cat.slug ? 'bg-primary/15 font-medium text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Mobile category chips */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            <a
              href="/tienda"
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!params.categoria ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              Todos
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/tienda?categoria=${cat.slug}`}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${params.categoria === cat.slug ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
              >
                {cat.icon} {cat.name}
              </a>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/50 py-20 text-center">
              <p className="text-4xl mb-4">🐠</p>
              <p className="text-muted-foreground">No hay productos en esta categoría.</p>
              <a href="/tienda" className="mt-4 inline-block text-sm text-primary hover:underline">
                Ver todo el catálogo
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
