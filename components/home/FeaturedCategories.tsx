import { db } from '@/lib/db'
import { CategoryCard } from './CategoryCard'

async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { order: 'asc' },
      take: 8,
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} cat={cat} index={i} />
        ))}
      </div>
    </section>
  )
}
