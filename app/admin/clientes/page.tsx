'use client'

import { useEffect, useState } from 'react'
import {
  Users, Mail, Phone, MapPin, ShoppingCart,
  CheckCircle, XCircle, Clock, Search, Send,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Customer {
  name: string
  email: string
  phone: string
  city: string
  orders: number
  totalSpent: number
  lastOrder: string
  paidOrders: number
}

interface EmailLog {
  id: string
  to: string
  subject: string
  type: string
  orderId: string | null
  resendId: string | null
  status: string
  createdAt: string
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

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'customers' | 'emails'>('customers')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || [])
        setEmails(data.emails || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const filteredEmails = emails.filter((e) =>
    e.to.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const totalEmails = emails.length
  const sentEmails = emails.filter((e) => e.status === 'sent').length
  const failedEmails = emails.filter((e) => e.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Clientes & Emails</h1>
        <p className="text-sm text-muted-foreground">
          {customers.length} clientes · {totalEmails} emails enviados
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2.5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes</p>
              <p className="text-xl font-bold">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/15 p-2.5">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
              <p className="text-xl font-bold">{formatCOP(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/15 p-2.5">
              <Send className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Emails enviados</p>
              <p className="text-xl font-bold">{sentEmails}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/10 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/15 p-2.5">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Emails fallidos</p>
              <p className="text-xl font-bold">{failedEmails}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-lg border border-primary/10 bg-card p-1">
          <button
            onClick={() => setTab('customers')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              tab === 'customers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="mr-2 inline h-4 w-4" />
            Clientes ({customers.length})
          </button>
          <button
            onClick={() => setTab('emails')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              tab === 'emails' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="mr-2 inline h-4 w-4" />
            Emails ({totalEmails})
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tab === 'customers' ? 'Buscar cliente...' : 'Buscar email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-primary/10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tab === 'customers' ? (
        /* Customers Table */
        filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Users className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay clientes aún</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10 bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Ciudad</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Pedidos</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Total gastado</th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell text-right">Último pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.email} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {customer.email}
                            </span>
                            <span className="hidden items-center gap-1 lg:flex">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {customer.city}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-semibold">{customer.orders}</span>
                      {customer.paidOrders > 0 && (
                        <span className="ml-1 text-[10px] text-emerald-400">
                          ({customer.paidOrders} pagado{customer.paidOrders > 1 ? 's' : ''})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-sm font-bold">{formatCOP(customer.totalSpent)}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-right sm:table-cell">
                      <span className="text-xs text-muted-foreground">{timeAgo(customer.lastOrder)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Emails Table */
        filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Mail className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay emails registrados</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10 bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10 text-left">
                  <th className="w-10 px-5 py-3" />
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatario</th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Asunto</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Tipo</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Estado</th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        email.status === 'sent' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                      }`}>
                        {email.status === 'sent' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium">{email.to}</p>
                      <p className="text-xs text-muted-foreground md:hidden line-clamp-1">{email.subject}</p>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <p className="text-xs text-muted-foreground line-clamp-1">{email.subject}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          email.type === 'order_confirmation'
                            ? 'border-blue-400/30 text-blue-400'
                            : 'border-amber-400/30 text-amber-400'
                        }`}
                      >
                        {email.type === 'order_confirmation' ? 'Confirmación' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge
                        variant={email.status === 'sent' ? 'default' : 'destructive'}
                        className="text-[10px]"
                      >
                        {email.status === 'sent' ? 'Enviado' : 'Fallido'}
                      </Badge>
                    </td>
                    <td className="hidden px-5 py-3 text-right sm:table-cell">
                      <span className="text-xs text-muted-foreground">{timeAgo(email.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
