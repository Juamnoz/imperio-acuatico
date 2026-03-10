'use client'

import { useEffect, useState } from 'react'
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Clock, CheckCircle, AlertCircle, ArrowUpRight,
  Users, Mail, CalendarDays, BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface TimelineEntry { orders: number; revenue: number }
interface DailyPoint { date: string; label: string; orders: number; revenue: number }

interface Stats {
  products: { total: number; available: number }
  orders: { total: number; paid: number; pending: number }
  categories: number
  revenue: number
  recentOrders: any[]
  topProducts: any[]
  timeline: { today: TimelineEntry; week: TimelineEntry; month: TimelineEntry }
  dailyChart: DailyPoint[]
  totalCustomers: number
  emailsSent: number
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)
}

function formatCompact(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return formatCOP(amount)
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-card p-5 transition-all hover:border-primary/25 hover:shadow-[0_0_30px_rgba(13,115,119,0.08)]">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${color} opacity-10 transition-all group-hover:opacity-20`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`rounded-lg ${color} p-2.5`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'outline' },
  PAID: { label: 'Pagado', variant: 'default' },
  PROCESSING: { label: 'Procesando', variant: 'secondary' },
  SHIPPED: { label: 'Enviado', variant: 'secondary' },
  DELIVERED: { label: 'Entregado', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

function MiniChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null
  const maxOrders = Math.max(...data.map((d) => d.orders), 1)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="space-y-4">
      {/* Revenue bars */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">Ingresos últimos 30 días</p>
          <p className="text-xs text-muted-foreground">
            Total: <span className="text-foreground font-semibold">{formatCOP(data.reduce((s, d) => s + d.revenue, 0))}</span>
          </p>
        </div>
        <div className="flex items-end gap-[2px] h-24">
          {data.map((d) => (
            <div key={d.date} className="group/bar relative flex-1 flex flex-col justify-end h-full">
              <div
                className="w-full rounded-t-sm bg-primary/60 transition-colors group-hover/bar:bg-primary min-h-[2px]"
                style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/bar:block z-10">
                <div className="whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow-lg border border-border">
                  <p className="font-semibold">{d.label}</p>
                  <p className="text-primary">{formatCOP(d.revenue)}</p>
                  <p>{d.orders} pedidos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{data[0]?.label}</span>
          <span className="text-[10px] text-muted-foreground">{data[data.length - 1]?.label}</span>
        </div>
      </div>

      {/* Orders line */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Pedidos últimos 30 días</p>
        <div className="flex items-end gap-[2px] h-16">
          {data.map((d) => (
            <div key={d.date} className="group/bar relative flex-1 flex flex-col justify-end h-full">
              <div
                className="w-full rounded-t-sm bg-blue-500/50 transition-colors group-hover/bar:bg-blue-500 min-h-[2px]"
                style={{ height: `${Math.max((d.orders / maxOrders) * 100, 2)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineTabs({ timeline }: { timeline: Stats['timeline'] }) {
  const [tab, setTab] = useState<'today' | 'week' | 'month'>('today')
  const tabs = [
    { key: 'today' as const, label: 'Hoy' },
    { key: 'week' as const, label: 'Semana' },
    { key: 'month' as const, label: 'Mes' },
  ]
  const data = timeline[tab]

  return (
    <div className="rounded-xl border border-primary/10 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Resumen por período</h3>
        </div>
        <div className="flex rounded-lg bg-muted p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground mb-1">Pedidos</p>
          <p className="font-display text-3xl font-bold">{data.orders}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
          <p className="font-display text-3xl font-bold text-primary">{formatCompact(data.revenue)}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vista general de Imperio Acuático</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Ingresos totales"
          value={formatCOP(stats.revenue)}
          sub={`${stats.orders.paid} pedidos pagados`}
          color="bg-emerald-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Pedidos"
          value={stats.orders.total.toString()}
          sub={`${stats.orders.pending} pendientes`}
          color="bg-blue-600"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value={stats.totalCustomers.toString()}
          sub={`${stats.emailsSent} emails enviados`}
          color="bg-violet-600"
        />
        <StatCard
          icon={Package}
          label="Productos"
          value={stats.products.total.toString()}
          sub={`${stats.products.available} disponibles`}
          color="bg-primary"
        />
      </div>

      {/* Timeline + Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TimelineTabs timeline={stats.timeline} />
        <div className="lg:col-span-2 rounded-xl border border-primary/10 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Actividad</h3>
          </div>
          <MiniChart data={stats.dailyChart} />
        </div>
      </div>

      {/* Orders + Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-primary/10 bg-card">
          <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
            <h2 className="font-display text-base font-semibold">Pedidos Recientes</h2>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-primary/5">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No hay pedidos aún</p>
              </div>
            ) : (
              stats.recentOrders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                return (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {order.status === 'PAID' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : order.status === 'PENDING' ? (
                        <Clock className="h-4 w-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 && 's'} · {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCOP(order.total)}</p>
                      <Badge variant={statusCfg.variant} className="mt-1 text-[10px]">
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-primary/10 bg-card">
          <div className="border-b border-primary/10 px-5 py-4">
            <h2 className="font-display text-base font-semibold">Productos Más Vendidos</h2>
          </div>
          <div className="divide-y divide-primary/5">
            {stats.topProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
              </div>
            ) : (
              stats.topProducts.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item._sum.quantity} uds
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/analitica"
          className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card p-4 transition-all hover:border-primary/25"
        >
          <div className="rounded-lg bg-orange-500/15 p-2">
            <BarChart3 className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Analítica y Píxeles</p>
            <p className="text-xs text-muted-foreground">GA4, Meta, TikTok</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/admin/clientes"
          className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card p-4 transition-all hover:border-primary/25"
        >
          <div className="rounded-lg bg-violet-500/15 p-2">
            <Mail className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Clientes y Emails</p>
            <p className="text-xs text-muted-foreground">{stats.totalCustomers} clientes</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/admin/integraciones"
          className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card p-4 transition-all hover:border-primary/25"
        >
          <div className="rounded-lg bg-green-500/15 p-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Integraciones</p>
            <p className="text-xs text-muted-foreground">MercadoPago, Alegra</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
