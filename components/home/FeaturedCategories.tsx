import Link from 'next/link'
import { db } from '@/lib/db'

async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { order: 'asc' },
      take: 6,
    })
  } catch {
    return []
  }
}

export async function FeaturedCategories() {
  const categories = await getCategories()

  return (
    <section className="container mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <p className="mb-1 text-sm font-medium text-primary">Explora por categoría</p>
        <h2 className="font-display text-4xl font-bold text-foreground">Nuestro Catálogo</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 p-5 text-center transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-3xl transition-all group-hover:bg-primary/20 group-hover:scale-110">
              {cat.icon ?? '🐠'}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground leading-tight">{cat.name}</p>
              {cat.description && (
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
