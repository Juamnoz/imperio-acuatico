'use client'

import { useState, useEffect } from 'react'
import {
  RefreshCw, CheckCircle, XCircle, Loader2,
  CreditCard, FileText, Database, MessageCircle, Save,
  ArrowRight, Shield, AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
  status: 'connected' | 'disconnected' | 'error'
  fields: { key: string; label: string; type: 'text' | 'password'; value: string }[]
  actions?: { label: string; action: string; icon: any }[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'alegra',
    name: 'Alegra',
    description: 'Sistema contable — Sincronización de productos, stock y facturación automática',
    icon: FileText,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    status: 'connected',
    fields: [
      { key: 'ALEGRA_EMAIL', label: 'Email', type: 'text', value: 'natyjaramillo81@gmail.com' },
      { key: 'ALEGRA_TOKEN', label: 'Token API', type: 'password', value: '••••••••••••••••••••' },
    ],
    actions: [
      { label: 'Sincronizar productos', action: 'sync', icon: RefreshCw },
    ],
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Pasarela de pagos — Cobros con tarjeta, PSE, Nequi y efectivo',
    icon: CreditCard,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    status: 'connected',
    fields: [
      { key: 'NEXT_PUBLIC_MP_PUBLIC_KEY', label: 'Public Key', type: 'password', value: 'APP_USR-7ea3...dc0' },
      { key: 'MP_ACCESS_TOKEN', label: 'Access Token', type: 'password', value: 'APP_USR-119...630' },
      { key: 'MP_CLIENT_ID', label: 'Client ID', type: 'text', value: '1195812406544028' },
    ],
    actions: [
      { label: 'Probar pago', action: 'test-mp', icon: CreditCard },
    ],
  },
  {
    id: 'neon',
    name: 'Neon PostgreSQL',
    description: 'Base de datos — PostgreSQL serverless en la nube',
    icon: Database,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15',
    status: 'connected',
    fields: [
      { key: 'DATABASE_URL', label: 'Connection String', type: 'password', value: '••••••••••••••••••••' },
    ],
  },
]

const STATUS_MAP = {
  connected: { label: 'Conectado', icon: CheckCircle, color: 'text-emerald-400' },
  disconnected: { label: 'Desconectado', icon: XCircle, color: 'text-muted-foreground' },
  error: { label: 'Error', icon: XCircle, color: 'text-red-400' },
}

export default function IntegracionesPage() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [showFields, setShowFields] = useState<Record<string, boolean>>({})
  const [mpSandbox, setMpSandbox] = useState(true)
  const [switchingMode, setSwitchingMode] = useState(false)
  const [modeMessage, setModeMessage] = useState<string | null>(null)

  // LISA state
  const [lisaSyncKey, setLisaSyncKey] = useState('')
  const [lisaApiUrl, setLisaApiUrl] = useState('')
  const [lisaAgentId, setLisaAgentId] = useState('')
  const [savingLisa, setSavingLisa] = useState(false)
  const [lisaMessage, setLisaMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        setMpSandbox(d.mpSandbox ?? true)
        setLisaSyncKey(d.lisaSyncKey ?? '')
        setLisaApiUrl(d.lisaApiUrl ?? '')
        setLisaAgentId(d.lisaAgentId ?? '')
      })
      .catch(() => {})
  }, [])

  async function toggleSandbox(value: boolean) {
    setSwitchingMode(true)
    setModeMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpSandbox: value }),
      })
      const data = await res.json()
      setMpSandbox(value)
      setModeMessage(data.message)
    } catch {
      setModeMessage('Error al cambiar el modo')
    }
    setSwitchingMode(false)
  }

  async function saveLisaSettings() {
    setSavingLisa(true)
    setLisaMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lisaSyncKey, lisaApiUrl, lisaAgentId }),
      })
      const data = await res.json()
      setLisaMessage(data.message ?? 'Guardado')
    } catch {
      setLisaMessage('Error al guardar')
    }
    setSavingLisa(false)
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/alegra/sync?key=imperio-sync-2026', { method: 'POST' })
      const data = await res.json()
      setSyncResult(data)
    } catch (err) {
      setSyncResult({ error: 'Error de conexión' })
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Integraciones</h1>
        <p className="text-sm text-muted-foreground">Administra las conexiones de tu tienda</p>
      </div>

      {/* Flow diagram */}
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Flujo de una venta
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 font-medium text-primary">
            Cliente compra
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 font-medium text-blue-400">
            MercadoPago cobra
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 font-medium text-violet-400">
            Webhook actualiza DB
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400">
            Alegra crea factura
          </span>
        </div>
      </div>

      {/* LISA Card */}
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-card">
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15">
            <MessageCircle className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-semibold">LISA</h3>
              <div className={`flex items-center gap-1 ${lisaSyncKey ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {lisaSyncKey ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium">{lisaSyncKey ? 'Conectado' : 'Sin configurar'}</span>
              </div>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Agente de WhatsApp — Sincronización de pedidos y catálogo en tiempo real
            </p>
          </div>
          <button
            onClick={() => setShowFields((prev) => ({ ...prev, lisa: !prev.lisa }))}
            className="shrink-0 rounded-lg border border-primary/10 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {showFields.lisa ? 'Ocultar' : 'Configurar'}
          </button>
        </div>

        {showFields.lisa && (
          <div className="border-t border-primary/10 bg-muted/10 p-5 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-3 w-3" />
                Clave de sincronización
                <span className="text-[10px] text-primary/50">Generada desde LISA → Tienda → Generar clave</span>
              </label>
              <Input
                type="password"
                placeholder="Pega aquí la clave generada en LISA"
                value={lisaSyncKey}
                onChange={(e) => setLisaSyncKey(e.target.value)}
                className="bg-card border-primary/10 font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-3 w-3" />
                URL de la API de LISA
              </label>
              <Input
                type="text"
                placeholder="https://api.lisa.tudominio.com"
                value={lisaApiUrl}
                onChange={(e) => setLisaApiUrl(e.target.value)}
                className="bg-card border-primary/10 font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-3 w-3" />
                Agent ID
              </label>
              <Input
                type="text"
                placeholder="UUID del agente en LISA"
                value={lisaAgentId}
                onChange={(e) => setLisaAgentId(e.target.value)}
                className="bg-card border-primary/10 font-mono text-xs"
              />
            </div>

            {lisaMessage && (
              <div className={`rounded-lg p-3 text-xs font-medium ${
                lisaMessage.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {lisaMessage}
              </div>
            )}

            <button
              onClick={saveLisaSettings}
              disabled={savingLisa}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {savingLisa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingLisa ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        )}
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const statusInfo = STATUS_MAP[integration.status]
          const isExpanded = showFields[integration.id] || false

          return (
            <div
              key={integration.id}
              className="overflow-hidden rounded-xl border border-primary/10 bg-card transition-all hover:border-primary/20"
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${integration.bgColor}`}>
                  <integration.icon className={`h-6 w-6 ${integration.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-semibold">{integration.name}</h3>
                    <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                      <statusInfo.icon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{statusInfo.label}</span>
                    </div>
                    {integration.id === 'mercadopago' && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${mpSandbox ? 'border-amber-400/30 text-amber-400' : 'border-emerald-400/30 text-emerald-400'}`}
                      >
                        {mpSandbox ? 'SANDBOX' : 'PRODUCCIÓN'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{integration.description}</p>
                </div>

                <button
                  onClick={() => setShowFields((prev) => ({ ...prev, [integration.id]: !prev[integration.id] }))}
                  className="shrink-0 rounded-lg border border-primary/10 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {isExpanded ? 'Ocultar' : 'Configurar'}
                </button>
              </div>

              {/* Expanded config */}
              {isExpanded && (
                <div className="border-t border-primary/10 bg-muted/10 p-5">
                  {/* MercadoPago Sandbox Toggle */}
                  {integration.id === 'mercadopago' && (
                    <div className="mb-5 rounded-xl border border-primary/10 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mpSandbox ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
                            {mpSandbox ? (
                              <AlertTriangle className="h-5 w-5 text-amber-400" />
                            ) : (
                              <CreditCard className="h-5 w-5 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {mpSandbox ? 'Modo Sandbox (pruebas)' : 'Modo Producción (cobros reales)'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mpSandbox
                                ? 'Los pagos son simulados — no se cobra dinero real'
                                : 'Los pagos se cobran de verdad a los clientes'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${mpSandbox ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {mpSandbox ? 'Sandbox' : 'Producción'}
                          </span>
                          <Switch
                            checked={!mpSandbox}
                            onCheckedChange={(checked) => toggleSandbox(!checked)}
                            disabled={switchingMode}
                          />
                        </div>
                      </div>

                      {/* Sandbox test credentials */}
                      {mpSandbox && (
                        <div className="mt-4 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                          <p className="text-xs font-semibold text-amber-400 mb-2">Credenciales de comprador de prueba</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Usuario:</span>
                              <p className="font-mono text-foreground select-all">TESTUSER1223356577219787944</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contraseña:</span>
                              <p className="font-mono text-foreground select-all">XrxReX6Eyf</p>
                            </div>
                          </div>
                          <p className="mt-2 text-[11px] text-muted-foreground/60">
                            Usa estas credenciales al pagar en MercadoPago sandbox para simular un comprador
                          </p>
                        </div>
                      )}

                      {/* Mode change message */}
                      {modeMessage && (
                        <div className={`mt-3 rounded-lg p-3 text-xs font-medium ${
                          modeMessage.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
                        }`}>
                          {modeMessage}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {integration.fields.map((field) => (
                      <div key={field.key}>
                        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          {field.label}
                          <span className="text-[10px] text-primary/50">{field.key}</span>
                        </label>
                        <Input
                          type={field.type}
                          defaultValue={field.value}
                          readOnly
                          className="bg-card border-primary/10 font-mono text-xs"
                        />
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground/60">
                      Las credenciales se configuran en las variables de entorno del servidor (.env.local / Vercel)
                    </p>
                  </div>

                  {/* Actions */}
                  {integration.actions && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {integration.actions.map((action) => (
                        <button
                          key={action.action}
                          onClick={
                            action.action === 'sync' ? handleSync
                              : action.action === 'test-mp' ? () => window.open('/tienda', '_blank')
                              : undefined
                          }
                          disabled={action.action === 'sync' && syncing}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {action.action === 'sync' && syncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <action.icon className="h-4 w-4" />
                          )}
                          {action.action === 'sync' && syncing ? 'Sincronizando...' : action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sync result */}
                  {integration.id === 'alegra' && syncResult && (
                    <div className={`mt-4 rounded-lg p-4 ${syncResult.error ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                      {syncResult.error ? (
                        <p className="text-sm text-red-400">{syncResult.error}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-emerald-400">Sincronización exitosa</p>
                          <p className="text-xs text-muted-foreground">
                            {syncResult.totalAlegra} productos en Alegra ·{' '}
                            {syncResult.created} nuevos ·{' '}
                            {syncResult.updated} actualizados ·{' '}
                            {syncResult.skipped} omitidos
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Future Integrations */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Próximamente</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'WhatsApp Business', desc: 'Notificaciones automáticas de pedidos', icon: '💬' },
            { name: 'Interrapidísimo', desc: 'Guías de envío automáticas', icon: '📦' },
            { name: 'Google Analytics', desc: 'Métricas y conversiones', icon: '📊' },
          ].map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-dashed border-primary/10 bg-card/50 p-5 text-center"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
