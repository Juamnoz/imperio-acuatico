import Link from 'next/link'
import { Fish, Home, Store } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-20 flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="text-[120px] font-display font-extrabold text-primary/10 leading-none select-none">
          404
        </div>
        <Fish className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-primary animate-pulse" />
      </div>

      <h1 className="font-display text-3xl font-bold text-foreground mb-3">
        Página no encontrada
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Parece que este pez se escapó del acuario. La página que buscas no existe o fue movida.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Store className="h-4 w-4" />
          Tienda
        </Link>
      </div>
    </div>
  )
}
