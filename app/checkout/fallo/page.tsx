import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutFallo() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Pago rechazado</h1>
          <p className="text-muted-foreground">
            No se pudo procesar tu pago. Por favor intenta de nuevo o contáctanos para ayudarte.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Intentar de nuevo
          </Link>
          <a href="https://wa.me/573027471832" target="_blank" rel="noopener noreferrer"
            className="inline-flex rounded-xl border border-border px-6 py-3 font-semibold text-foreground hover:border-primary transition-colors">
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  )
}
