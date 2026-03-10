'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto max-w-7xl px-6 py-20 flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <h1 className="font-display text-3xl font-bold text-foreground mb-3">
        Algo salió mal
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Ocurrió un error inesperado. Por favor intenta de nuevo o regresa al inicio.
      </p>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>
      </div>
    </div>
  )
}
