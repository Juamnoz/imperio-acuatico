'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, ChevronLeft, ChevronRight, Package,
  Mail, Phone, MapPin, Truck, FileText,
  Loader2, Globe, MessageCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  PENDING: { label: 'Pendiente', variant: 'outline', color: 'text-amber-400' },
  PAID: { label: 'Pagado', variant: 'default', color: 'text-emerald-400' },
  PROCESSING: { label: 'Procesando', variant: 'secondary', color: 'text-blue-400' },
  SHIPPED: { label: 'Enviado', variant: 'secondary', color: 'text-violet-400' },
  DELIVERED: { label: 'Entregado', variant: 'default', color: 'text-emerald-400' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive', color: 'text-red-400' },
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function ChannelBadge({ source }: { source?: string }) {
  if (source === 'whatsapp') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
      <Globe className="h-3 w-3" /> Web
    </span>
  )
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (status !== 'all') params.set('status', status)
    if (search) params.set('q', search)

    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [page, status, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function updateOrder(orderId: string, data: any) {
    setUpdating(true)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...data }),
    })
    await fetchOrders()
    if (selected?.id === orderId) {
      setSelected((prev: any) => prev ? { ...prev, ...data } : null)
    }
    setUpdating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">{total} pedidos en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-card border-primary/10"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PAID">Pagado</SelectItem>
            <SelectItem value="PROCESSING">Procesando</SelectItem>
            <SelectItem value="SHIPPED">Enviado</SelectItem>
            <SelectItem value="DELIVERED">Entregado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No se encontraron pedidos</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canal</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alegra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {orders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelected(order)}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </td>
                        <td className="px-5 py-3">
                          <ChannelBadge source={order.source} />
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{order.items.length}</td>
                        <td className="px-5 py-3 text-sm font-semibold">{formatCOP(order.total)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3">
                          {order.alegraInvoiceId ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <FileText className="mr-1 h-3 w-3" /> #{order.alegraInvoiceId}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-primary/5 md:hidden">
              {orders.map((order) => {
                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="cursor-pointer px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <div className="flex items-center gap-2">
                        <ChannelBadge source={order.source} />
                        <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {order.items.length} items · {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </span>
                      <span className="text-sm font-semibold">{formatCOP(order.total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-primary/10 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded-lg border border-primary/10 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg border-primary/15 bg-card">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Pedido #{selected.id.slice(-8)}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Client info */}
                <div className="space-y-2 rounded-lg bg-muted/30 p-4">
                  <p className="text-sm font-semibold">{selected.customerName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {selected.customerEmail}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {selected.customerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {selected.customerAddress}, {selected.customerCity}
                  </div>
                  {selected.shippingMethod && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-3.5 w-3.5" /> {selected.shippingMethod}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos</p>
                  <div className="divide-y divide-primary/5 rounded-lg border border-primary/10">
                    {selected.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">{formatCOP(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-muted/20 px-4 py-2.5">
                      <p className="text-sm font-semibold">Total</p>
                      <p className="text-sm font-bold text-primary">{formatCOP(selected.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Status change */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cambiar estado</p>
                  <div className="flex flex-wrap gap-2">
                    {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => {
                      const sc = STATUS_CONFIG[s]
                      const isActive = selected.status === s
                      return (
                        <button
                          key={s}
                          disabled={updating || isActive}
                          onClick={() => updateOrder(selected.id, { status: s })}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            isActive
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-primary/10 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          } disabled:opacity-40`}
                        >
                          {sc.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Integrations info */}
                <div className="flex flex-wrap gap-3">
                  {selected.mpPaymentId && (
                    <div className="rounded-lg bg-blue-500/10 px-3 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-blue-400">MercadoPago</p>
                      <p className="text-xs">{selected.mpStatus} · #{selected.mpPaymentId}</p>
                    </div>
                  )}
                  {selected.alegraInvoiceId && (
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-emerald-400">Alegra</p>
                      <p className="text-xs">Factura #{selected.alegraInvoiceId}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
