import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) return { title: 'Artículo no encontrado' }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) notFound()

  return (
    <div className="container mx-auto max-w-3xl px-6 py-10">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al blog
      </Link>

      <article>
        <header className="mb-8">
          <p className="text-xs text-muted-foreground mb-3">
            {new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground">{post.title}</h1>
          {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
        </header>

        <div
          className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-headings:font-display prose-li:text-muted-foreground max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>').replace(/## /g, '<h2 class="font-display text-2xl font-bold mt-8 mb-4">').replace(/# /g, '<h1 class="font-display text-3xl font-bold mt-8 mb-4">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\d+\. /g, '<li>') }}
        />
      </article>
    </div>
  )
}
