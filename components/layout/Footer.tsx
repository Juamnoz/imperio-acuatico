import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, MessageCircle, Mail, MapPin, Clock, Fish } from 'lucide-react'

const hours = [
  { day: 'Lunes', time: '10:00 – 18:00' },
  { day: 'Mar / Jue / Vie', time: '10:00 – 20:00' },
  { day: 'Sábado', time: '10:00 – 18:00' },
  { day: 'Domingo', time: '10:00 – 15:00' },
  { day: 'Miércoles / Festivos', time: 'Cerrado' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo-white.png"
                alt="Imperio Acuático"
                width={240}
                height={75}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tienda especializada en peces ornamentales y accesorios acuáticos en Caldas, Antioquia.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://wa.me/573027471832"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/30"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/imperioacuatico.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 transition-colors hover:bg-pink-500/30"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@imperioacuatico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Catálogo</h3>
            <ul className="space-y-2 text-sm">
              {['Peces Ornamentales', 'Cíclidos Africanos', 'Cíclidos Americanos', 'Plantas Acuáticas', 'Equipos', 'Alimentos'].map((cat) => (
                <li key={cat}>
                  <Link href="/tienda" className="text-muted-foreground transition-colors hover:text-foreground">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Información</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Nosotros', href: '/nosotros' },
                { label: 'Blog', href: '/blog' },
                { label: 'Políticas de envío', href: '/nosotros#envios' },
                { label: 'Garantías', href: '/nosotros#garantias' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:imperioempresas.com@gmail.com" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Empresas
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Horarios</h3>
            <ul className="space-y-1.5">
              {hours.map(({ day, time }) => (
                <li key={day} className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{day}</span>
                  <span className={time === 'Cerrado' ? 'text-destructive' : 'text-foreground font-medium'}>{time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>Cra 48 #127sur-78, El Olaya, Caldas, Antioquia</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Imperio Acuático. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <Fish className="h-3.5 w-3.5 text-primary" />
            Caldas, Antioquia, Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
