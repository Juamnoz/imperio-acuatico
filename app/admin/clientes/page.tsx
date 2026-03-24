'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Mail, Phone, MapPin, ShoppingCart,
  CheckCircle, XCircle, Search, Send,
  Loader2, Plus, Pencil, RotateCw, UserPlus,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'

interface Customer {
  id: string | null
  name: string
  email: string
  phone: string
  city: string
  address: string
  notes: string | null
  orders: number
  totalSpent: number
  lastOrder: string
  paidOrders: number
  isRegistered: boolean
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

const emptyForm = { name: '', email: '', phone: '', city: '', address: '', notes: '' }

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'customers' | 'emails'>('customers')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  // Resend email modal
  const [resendOpen, setResendOpen] = useState(false)
  const [resendEmail, setResendEmail] = useState<EmailLog | null>(null)
  const [resendTo, setResendTo] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || [])
        setEmails(data.emails || [])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

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

  // Open create modal
  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalMode('create')
    setModalError('')
    setModalOpen(true)
  }

  // Open edit modal
  function openEdit(customer: Customer) {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address || '',
      notes: customer.notes || '',
    })
    setEditingId(customer.id)
    setModalMode('edit')
    setModalError('')
    setModalOpen(true)
  }

  // Save customer (create or edit)
  async function handleSave() {
    if (!form.name || !form.email || !form.phone || !form.city) {
      setModalError('Nombre, email, teléfono y ciudad son requeridos')
      return
    }
    setSaving(true)
    setModalError('')
    try {
      const isEdit = modalMode === 'edit' && editingId
      const res = await fetch('/api/admin/customers', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingId, ...form } : form),
      })
      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'Error guardando cliente')
        return
      }
      setModalOpen(false)
      fetchData()
    } catch {
      setModalError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Open resend email modal
  function openResend(email: EmailLog) {
    setResendEmail(email)
    setResendTo(email.to)
    setResendSuccess(false)
    setResendOpen(true)
  }

  // Resend email
  async function handleResend() {
    if (!resendEmail?.orderId) return
    setResending(true)
    try {
      const res = await fetch('/api/admin/customers/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: resendEmail.orderId, toEmail: resendTo }),
      })
      if (res.ok) {
        setResendSuccess(true)
        fetchData()
      }
    } catch { /* ignore */ } finally {
      setResending(false)
    }
  }

  // Register an orphan customer (from orders)
  async function registerOrphan(customer: Customer) {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address || '',
      notes: '',
    })
    setEditingId(null)
    setModalMode('create')
    setModalError('')
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Clientes & Emails</h1>
          <p className="text-sm text-muted-foreground">
            {customers.length} clientes · {totalEmails} emails enviados
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar cliente
        </Button>
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
            <Button variant="outline" onClick={openCreate} className="gap-2 mt-2">
              <Plus className="h-4 w-4" /> Agregar primer cliente
            </Button>
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
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-20">Acciones</th>
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{customer.name}</p>
                            {!customer.isRegistered && (
                              <Badge variant="outline" className="text-[9px] border-amber-400/30 text-amber-400">
                                Sin registrar
                              </Badge>
                            )}
                          </div>
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
                    <td className="px-5 py-3 text-center">
                      {customer.isRegistered ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(customer)}
                          title="Editar cliente"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => registerOrphan(customer)}
                          title="Registrar cliente"
                        >
                          <UserPlus className="h-4 w-4 text-amber-400" />
                        </Button>
                      )}
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
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-20">Acciones</th>
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
                    <td className="px-5 py-3 text-center">
                      {email.orderId && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openResend(email)}
                          title="Reenviar email"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create/Edit Customer Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-primary/10">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Agregar cliente' : 'Editar cliente'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Ingresa los datos del nuevo cliente.'
                : 'Modifica los datos del cliente.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre completo"
                  className="bg-background border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="bg-background border-primary/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="3001234567"
                  className="bg-background border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Medellín"
                  className="bg-background border-primary/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Dirección de envío"
                className="bg-background border-primary/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas internas sobre el cliente..."
                className="bg-background border-primary/10 min-h-[80px]"
              />
            </div>
            {modalError && (
              <p className="text-sm text-red-400">{modalError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {modalMode === 'create' ? 'Crear cliente' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Email Modal */}
      <Dialog open={resendOpen} onOpenChange={setResendOpen}>
        <DialogContent className="sm:max-w-md bg-card border-primary/10">
          <DialogHeader>
            <DialogTitle>Reenviar email</DialogTitle>
            <DialogDescription>
              Puedes cambiar el destinatario antes de reenviar.
            </DialogDescription>
          </DialogHeader>

          {resendSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Email reenviado exitosamente</p>
              <Button variant="outline" onClick={() => setResendOpen(false)}>
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/10 bg-background p-3">
                  <p className="text-xs text-muted-foreground mb-1">Asunto original</p>
                  <p className="text-sm">{resendEmail?.subject}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resend-to">Destinatario</Label>
                  <Input
                    id="resend-to"
                    type="email"
                    value={resendTo}
                    onChange={(e) => setResendTo(e.target.value)}
                    className="bg-background border-primary/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResendOpen(false)} disabled={resending}>
                  Cancelar
                </Button>
                <Button onClick={handleResend} disabled={resending || !resendTo} className="gap-2">
                  {resending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" />
                  Reenviar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
