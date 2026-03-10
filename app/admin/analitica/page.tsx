'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Save, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react'

interface PixelConfig {
  key: string
  label: string
  placeholder: string
  helpUrl: string
  helpLabel: string
  color: string
  icon: string
}

const PIXELS: PixelConfig[] = [
  {
    key: 'ga4_id',
    label: 'Google Analytics 4',
    placeholder: 'G-XXXXXXXXXX',
    helpUrl: 'https://analytics.google.com/',
    helpLabel: 'Obtener ID de medición',
    color: 'text-orange-400 bg-orange-500/15',
    icon: '📊',
  },
  {
    key: 'meta_pixel_id',
    label: 'Meta Pixel (Facebook / Instagram)',
    placeholder: '123456789012345',
    helpUrl: 'https://business.facebook.com/events_manager2',
    helpLabel: 'Configurar en Meta Business',
    color: 'text-blue-400 bg-blue-500/15',
    icon: '📘',
  },
  {
    key: 'tiktok_pixel_id',
    label: 'TikTok Pixel',
    placeholder: 'CXXXXXXXXXXXXXXXXX',
    helpUrl: 'https://ads.tiktok.com/marketing_api/docs?id=1739583652957185',
    helpLabel: 'Configurar en TikTok Ads',
    color: 'text-pink-400 bg-pink-500/15',
    icon: '🎵',
  },
]

const EVENTS_INFO = [
  { event: 'PageView', desc: 'Cada visita a cualquier página', ga: '✅', meta: '✅', tiktok: '✅' },
  { event: 'ViewContent', desc: 'Ver detalle de un producto', ga: '✅', meta: '✅', tiktok: '✅' },
  { event: 'AddToCart', desc: 'Agregar producto al carrito', ga: '✅', meta: '✅', tiktok: '✅' },
  { event: 'InitiateCheckout', desc: 'Iniciar proceso de pago', ga: '✅', meta: '✅', tiktok: '✅' },
  { event: 'Purchase', desc: 'Compra completada con éxito', ga: '✅', meta: '✅', tiktok: '✅' },
]

export default function AnaliticaPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/analytics', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const activeCount = PIXELS.filter((p) => settings[p.key]?.trim()).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Analítica y Píxeles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecta tus plataformas de publicidad para rastrear conversiones y crear audiencias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${activeCount > 0 ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${activeCount > 0 ? 'bg-green-400' : 'bg-muted-foreground'}`} />
          {activeCount} de {PIXELS.length} píxeles activos
        </span>
      </div>

      {/* Pixel cards */}
      <div className="grid gap-5">
        {PIXELS.map((pixel) => {
          const value = settings[pixel.key] ?? ''
          const isActive = value.trim().length > 0
          return (
            <div
              key={pixel.key}
              className={`rounded-2xl border p-5 transition-colors ${isActive ? 'border-primary/30 bg-card' : 'border-border bg-card/50'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${pixel.color}`}>
                    {pixel.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {pixel.label}
                      {isActive && (
                        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                          Activo
                        </span>
                      )}
                    </h3>
                    <a
                      href={pixel.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                    >
                      {pixel.helpLabel}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  ID del píxel
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setSettings({ ...settings, [pixel.key]: e.target.value })}
                  placeholder={pixel.placeholder}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Events table */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Eventos de e-commerce rastreados</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Estos eventos se envían automáticamente cuando los usuarios interactúan con tu tienda.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Evento</th>
                <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Descripción</th>
                <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-center">GA4</th>
                <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-center">Meta</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-center">TikTok</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS_INFO.map((e) => (
                <tr key={e.event} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-xs text-primary">{e.event}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{e.desc}</td>
                  <td className="py-2.5 pr-4 text-center">{e.ga}</td>
                  <td className="py-2.5 pr-4 text-center">{e.meta}</td>
                  <td className="py-2.5 text-center">{e.tiktok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Cómo obtener tus IDs</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-orange-400">Google Analytics 4</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Ve a analytics.google.com</li>
              <li>Admin → Flujos de datos → Tu sitio web</li>
              <li>Copia el ID de medición (G-XXXXXXXXXX)</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-blue-400">Meta Pixel</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Ve a business.facebook.com</li>
              <li>Administrador de eventos → Orígenes de datos</li>
              <li>Crea un píxel y copia el ID (15 dígitos)</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-pink-400">TikTok Pixel</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
              <li>Ve a ads.tiktok.com</li>
              <li>Herramientas → Eventos → Administrar</li>
              <li>Crea un píxel web y copia el ID</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
