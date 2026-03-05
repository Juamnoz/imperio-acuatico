import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { MessageCircle, Truck, Shield, Award } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: 'Pre-desparasitados',
    description: 'Todos nuestros peces incluyen protocolo de salud antes de la venta.',
  },
  {
    icon: Truck,
    title: 'Envíos a Antioquia',
    description: 'Despachos los lunes por Interrapidísimo. Domicilio en Medellín mismo día.',
  },
  {
    icon: Award,
    title: 'Asesoría experta',
    description: 'Más de 5 años de experiencia. Te guiamos para crear el acuario ideal.',
  },
  {
    icon: MessageCircle,
    title: 'Atención por WhatsApp',
    description: 'Respuesta rápida para cotizaciones, dudas y seguimiento de pedidos.',
  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Features strip */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{feat.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <FeaturedCategories />
      <FeaturedProducts />

      {/* CTA WhatsApp */}
      <section className="container mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.52_0.1_195_/_15%),transparent)]" />
          <div className="relative z-10">
            <p className="mb-2 text-sm font-medium text-primary">¿Listo para comenzar?</p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Tu acuario perfecto<br />está a un mensaje
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Escríbenos por WhatsApp para cotizaciones, asesoría personalizada o cualquier pregunta sobre nuestros peces.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/573027471832?text=Hola%2C%20quiero%20asesoría%20para%20mi%20acuario"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-600 hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Chatear en WhatsApp
              </a>
              <Link
                href="/tienda"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-all hover:border-primary hover:-translate-y-0.5"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
