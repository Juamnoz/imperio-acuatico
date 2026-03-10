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
  const product = await db.product.findUnique({ where: { slug }, include: { category: true } })
  if (!product) return { title: 'Producto no encontrado' }

  const images = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const siteUrl = process.env.NEXT_PUBLIC_URL ?? 'https://imperioacuatico.co'

  return {
    title: product.name,
    description: product.description ?? `${product.name} disponible en Imperio Acuático. Envíos a todo Colombia.`,
    alternates: { canonical: `${siteUrl}/tienda/${product.slug}` },
    openGraph: {
      title: `${product.name} — Imperio Acuático`,
      description: product.description ?? `${product.name} — Categoría: ${product.category.name}`,
      url: `${siteUrl}/tienda/${product.slug}`,
      images: images[0] ? [{ url: images[0], width: 600, height: 600, alt: product.name }] : [],
      type: 'website',
    },
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

  const images = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const siteUrl = process.env.NEXT_PUBLIC_URL ?? 'https://imperioacuatico.co'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.name,
    image: images[0] ? `${siteUrl}${images[0]}` : undefined,
    url: `${siteUrl}/tienda/${product.slug}`,
    brand: { '@type': 'Brand', name: 'Imperio Acuático' },
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'COP',
      availability: product.available && product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Imperio Acuático' },
    },
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
