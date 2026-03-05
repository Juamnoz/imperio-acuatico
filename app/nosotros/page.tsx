import { MapPin, Clock, Phone, Instagram, Youtube, Facebook, Mail, Shield, Truck, Award, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nosotros' }

const hours = [
  { day: 'Lunes', time: '10:00 – 18:00' },
  { day: 'Martes', time: '10:00 – 20:00' },
  { day: 'Miércoles', time: 'Cerrado' },
  { day: 'Jueves', time: '10:00 – 20:00' },
  { day: 'Viernes', time: '10:00 – 20:00' },
  { day: 'Sábado', time: '10:00 – 18:00' },
  { day: 'Domingo', time: '10:00 – 15:00' },
  { day: 'Festivos', time: 'Cerrado' },
]

export default function NosotrosPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      {/* Hero */}
      <div className="mb-14 text-center">
        <p className="mb-2 text-sm font-medium text-primary">Sobre nosotros</p>
        <h1 className="font-display text-5xl font-bold text-foreground mb-4">Imperio Acuático</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tienda especializada en peces ornamentales y accesorios acuáticos en Caldas, Antioquia.
          Más de 5 años creando ecosistemas acuáticos con pasión y expertise.
        </p>
      </div>

      {/* Valores */}
      <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { icon: Shield, title: 'Salud garantizada', desc: 'Todos nuestros peces llegan pre-desparasitados y con protocolo de aclimatación incluido.' },
          { icon: Award, title: 'Asesoría experta', desc: 'Te guiamos desde la elección de tu primer pez hasta el montaje de acuarios complejos.' },
          { icon: Truck, title: 'Envíos confiables', desc: 'Despachos seguros los lunes por Interrapidísimo. Domicilio en Medellín mismo día.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Contacto */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-5">Contáctanos</h2>
            <div className="space-y-4">
              <a href="https://wa.me/573027471832" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">3027471832 — Helen Natalia</p>
                </div>
              </a>

              <div className="flex items-start gap-3 rounded-xl p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ubicación</p>
                  <p className="text-xs text-muted-foreground">Cra 48 #127sur-78, El Olaya<br />Caldas, Antioquia</p>
                </div>
              </div>

              <a href="mailto:imperioempresas.com@gmail.com"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email empresas</p>
                  <p className="text-xs text-muted-foreground">imperioempresas.com@gmail.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 pt-2">
                {[
                  { href: 'https://instagram.com/imperioacuatico.co', icon: Instagram, color: 'bg-pink-500/20 text-pink-400', label: 'Instagram' },
                  { href: 'https://youtube.com/@imperioacuatico', icon: Youtube, color: 'bg-red-500/20 text-red-400', label: 'YouTube' },
                  { href: 'https://facebook.com/imperioacuatico', icon: Facebook, color: 'bg-blue-500/20 text-blue-400', label: 'Facebook' },
                ].map(({ href, icon: Icon, color, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${color} transition-opacity hover:opacity-80`}
                    title={label}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Políticas */}
          <div id="envios" className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Políticas de envío</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🗓️ Despachos <strong className="text-foreground">solo los lunes</strong> por Interrapidísimo</li>
              <li>📦 Costo: $11.000 – $68.000 según zona (1-3 días hábiles)</li>
              <li>🐟 Peces: solo envíos en Antioquia (caja icopor)</li>
              <li>🚚 Domicilio Medellín: mensajero mismo día (pedidos antes 3pm)</li>
              <li>💰 Mínimo $60.000 para envíos nacionales</li>
              <li>❌ NO contra entrega · NO Nequi · NO efectivo por WhatsApp</li>
            </ul>
          </div>

          <div id="garantias" className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Garantías y devoluciones</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🔧 Equipos Resun/lámparas: <strong className="text-foreground">3 meses</strong> por fallo de fábrica</li>
              <li>📦 Requiere caja original y no aplica por mal uso</li>
              <li>🎥 Devoluciones: video sin cortes destapando el paquete</li>
              <li>🐠 Apartar peces: máximo 10 días (requiere abono)</li>
              <li>🎁 Obsequio en compras superiores a $100.000</li>
            </ul>
          </div>
        </div>

        {/* Horarios */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Horarios de atención
            </h2>
            <ul className="space-y-2">
              {hours.map(({ day, time }) => (
                <li key={day} className={`flex justify-between rounded-lg px-3 py-2 text-sm ${time === 'Cerrado' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  <span className="font-medium">{day}</span>
                  <span className={time === 'Cerrado' ? 'text-destructive' : 'text-primary font-semibold'}>{time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-primary/10 border border-primary/20 p-4 text-xs text-muted-foreground">
              <p>El agente IA <strong className="text-primary">Tritón</strong> responde por WhatsApp 24/7.
              Para compras y cotizaciones, Helen te atiende en horario de tienda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
