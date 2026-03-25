'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Mail, CheckCircle, XCircle, Search, Send,
  Loader2, AlertTriangle, ShoppingCart, User,
  Phone, MapPin, ExternalLink, RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface AdminNotification {
  id: string
  subject: string
  status: string
  errorMessage: string | null
  resendId: string | null
  createdAt: string
  orderId: string | null
  order: {
    customerName: string
    customerEmail: string
    customerPhone: string
    customerCity: string
    total: number
    status: string
    items: OrderItem[]
    createdAt: string
  } | null
}

interface Stats {
  total: number
  sent: number
  failed: number
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days}d`
  return new Date(date).toLocaleDateString('es-CO')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CorreoAdminPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all')

  // Detail modal
  const [selected, setSelected] = useState<AdminNotification | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Resend state
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<'success' | 'error' | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/correo')
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || [])
        setStats(data.stats || { total: 0, sent: 0, failed: 0 })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = notifications
    .filter((n) => {
      if (filter === 'sent') return n.status === 'sent'
      if (filter === 'failed') return n.status === 'failed'
      return true
    })
    .filter((n) =>
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.order?.customerName.toLowerCase().includes(search.toLowerCase()) ||
      n.order?.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      n.errorMessage?.toLowerCase().includes(search.toLowerCase())
    )

  function openDetail(notif: AdminNotification) {
    setSelected(notif)
    setResendResult(null)
    setDetailOpen(true)
  }

  async function handleResend() {
    if (!selected?.orderId) return
    setResending(true)
    setResendResult(null)
    try {
      const res = await fetch('/api/admin/customers/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selected.orderId }),
      })
      setResendResult(res.ok ? 'success' : 'error')
      if (res.ok) fetchData()
    } catch {
      setResendResult('error')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Correo Admin</h1>
          <p className="text-sm text-muted-foreground">
            Notificaciones de ventas y pedidos
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2.5">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total notificaciones</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/15 p-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entregados</p>
              <p className="text-xl font-bold">{stats.sent}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/15 p-2.5">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fallidos</p>
              <p className="text-xl font-bold text-red-400">{stats.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-lg border border-primary/10 bg-card p-1">
          {(['all', 'sent', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'sent' ? 'Entregados' : 'Fallidos'}
              {f === 'failed' && stats.failed > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] text-red-400">
                  {stats.failed}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, asunto o error..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-primary/10"
          />
        </div>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Mail className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {filter !== 'all' ? 'No hay notificaciones con este filtro' : 'No hay notificaciones aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <button
              key={notif.id}
              onClick={() => openDetail(notif)}
              className="w-full rounded-xl border border-primary/10 bg-card p-4 text-left transition-all hover:border-primary/25 hover:bg-card/80"
            >
              <div className="flex items-start gap-4">
                {/* Status icon */}
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  notif.status === 'sent' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                }`}>
                  {notif.status === 'sent' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {notif.order ? `${notif.order.customerName}` : 'Notificación'}
                    </p>
                    {notif.order && (
                      <span className="shrink-0 text-sm font-bold text-primary">
                        {formatCOP(notif.order.total)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{notif.subject}</p>
                  {notif.status === 'failed' && notif.errorMessage && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-500/10 px-2.5 py-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                      <p className="truncate text-xs text-red-400">{notif.errorMessage}</p>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="shrink-0 text-right">
                  <span className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)}</span>
                  {notif.order && (
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          notif.order.status === 'PAID'
                            ? 'border-emerald-400/30 text-emerald-400'
                            : notif.order.status === 'CANCELLED'
                              ? 'border-red-400/30 text-red-400'
                              : 'border-amber-400/30 text-amber-400'
                        }`}
                      >
                        {notif.order.status === 'PAID' ? 'Pagado' : notif.order.status === 'CANCELLED' ? 'Cancelado' : 'Pendiente'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Detalle de notificación
            </DialogTitle>
            <DialogDescription>
              {selected?.createdAt && formatDate(selected.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Badge
                  variant={selected.status === 'sent' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {selected.status === 'sent' ? 'Entregado' : 'Fallido'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selected.subject}
                </span>
              </div>

              {/* Error message */}
              {selected.status === 'failed' && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-semibold text-red-400">Error de envío</span>
                  </div>
                  <p className="text-xs text-red-300">
                    {selected.errorMessage || 'Error desconocido — revisa la configuración de Resend y verifica que el dominio esté verificado.'}
                  </p>
                </div>
              )}

              {/* Order details */}
              {selected.order && (
                <>
                  <div className="rounded-lg border border-primary/10 bg-background p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Datos del cliente
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{selected.order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selected.order.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`https://wa.me/57${selected.order.customerPhone}`}
                          target="_blank"
                          rel="noopener"
                          className="text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {selected.order.customerPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selected.order.customerCity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="rounded-lg border border-primary/10 bg-background p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Productos
                    </p>
                    <div className="space-y-2">
                      {selected.order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>
                            {item.name}
                            <span className="ml-1 text-muted-foreground">x{item.quantity}</span>
                          </span>
                          <span className="font-medium">{formatCOP(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-primary/10 pt-2 flex items-center justify-between">
                        <span className="text-sm font-bold">Total</span>
                        <span className="text-lg font-bold text-primary">{formatCOP(selected.order.total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Resend result */}
              {resendResult === 'success' && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Emails reenviados correctamente</span>
                </div>
              )}
              {resendResult === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Error al reenviar</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {selected?.orderId && (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(`/admin/pedidos`, '_self')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver pedido
                </Button>
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  className="gap-2"
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Reenviar emails
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
