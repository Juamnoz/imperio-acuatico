import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutExito() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">¡Pago exitoso!</h1>
          <p className="text-muted-foreground">
            Tu pedido ha sido recibido. Te enviaremos una confirmación por email y nos pondremos en contacto contigo pronto.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <p>¿Tienes dudas sobre tu pedido?</p>
          <a href="https://wa.me/573027471832" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Escríbenos por WhatsApp
          </a>
        </div>
        <Link href="/tienda" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
