import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function CheckoutPendiente() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20">
            <Clock className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Pago en proceso</h1>
          <p className="text-muted-foreground">
            Tu pago está siendo procesado. Cuando sea confirmado te enviaremos un email con los detalles de tu pedido.
          </p>
        </div>
        <Link href="/" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
