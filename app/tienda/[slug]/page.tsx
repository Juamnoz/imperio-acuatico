import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ProductDetail } from '@/components/product/ProductDetail'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { ProductWithCategory } from '@/lib/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Imperio Acuático`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  }) as ProductWithCategory | null

  if (!product) notFound()

  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      available: true,
      NOT: { id: product.id },
    },
    include: { category: true },
    take: 4,
    orderBy: { featured: 'desc' },
  }) as ProductWithCategory[]

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            También en {product.category.name}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
