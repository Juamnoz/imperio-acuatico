import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { AquariumCTA } from '@/components/home/AquariumCTA'
import { Truck, Shield, Award, MessageCircle } from 'lucide-react'

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

      <AquariumCTA />
    </>
  )
}
