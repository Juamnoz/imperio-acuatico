import { db } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10">
        <p className="mb-1 text-sm font-medium text-primary">Consejos y guías</p>
        <h1 className="font-display text-4xl font-bold text-foreground">Blog Acuarístico</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No hay artículos publicados aún.</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>}
              <p className="mt-4 text-sm font-medium text-primary">Leer artículo →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
