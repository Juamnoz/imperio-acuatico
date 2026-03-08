import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { ProductWithCategory } from '@/lib/types'

async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  try {
    return await db.product.findMany({
      where: { featured: true, available: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }) as ProductWithCategory[]
  } catch {
    return []
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className="container mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Selección especial</p>
          <h2 className="font-display text-4xl font-bold text-foreground">
            Productos Destacados
          </h2>
        </div>
        <Link
          href="/tienda"
          className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:flex"
        >
          Ver todo el catálogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/50 py-16 text-center text-muted-foreground">
          <p>No hay productos destacados disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          href="/tienda"
          className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Ver todo el catálogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
