'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search, ChevronLeft, ChevronRight, Package,
  Mail, Phone, MapPin, Truck, FileText,
  Loader2, Globe, MessageCircle, Plus, Minus, Trash2, ShoppingCart,
  Pencil,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  PENDING: { label: 'Pendiente', variant: 'outline', color: 'text-amber-400' },
  PAID: { label: 'Pagado', variant: 'default', color: 'text-emerald-400' },
  PROCESSING: { label: 'Procesando', variant: 'secondary', color: 'text-blue-400' },
  SHIPPED: { label: 'Enviado', variant: 'secondary', color: 'text-violet-400' },
  DELIVERED: { label: 'Entregado', variant: 'default', color: 'text-emerald-400' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive', color: 'text-red-400' },
}

const SHIPPING_OPTIONS = [
  { id: 'tienda', label: 'Recoge en tienda', price: 0 },
  { id: 'domicilio', label: 'Domicilio Medellín', price: 20000 },
  { id: 'nacional', label: 'Envío nacional', price: 20000 },
]

const CHANNEL_OPTIONS = [
  { id: 'web', label: 'Web' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'direct', label: 'Directo' },
]

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface SimpleProduct {
  id: string
  name: string
  price: number
  stock: number
  available: boolean
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
  if (source === 'direct') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
        <Package className="h-3 w-3" /> Directo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
      <Globe className="h-3 w-3" /> Web
    </span>
  )
}

const emptyCustomerForm = { name: '', email: '', phone: '', city: '', address: '' }

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

  // Create order modal
  const [createOpen, setCreateOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [shippingMethod, setShippingMethod] = useState('tienda')
  const [orderStatus, setOrderStatus] = useState('PAID')
  const [orderSource, setOrderSource] = useState('whatsapp')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit items in detail modal
  const [editingItems, setEditingItems] = useState(false)
  const [detailCart, setDetailCart] = useState<CartItem[]>([])
  const [detailProductSearch, setDetailProductSearch] = useState('')
  const [savingItems, setSavingItems] = useState(false)

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  // Fetch products and customers when create modal opens
  useEffect(() => {
    if (!createOpen) return
    fetch('/api/admin/products?limit=500')
      .then((r) => r.json())
      .then((data) => setProducts((data.products || []).filter((p: SimpleProduct) => p.available)))
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
  }, [createOpen])

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

  // Create order modal helpers
  function openCreateOrder() {
    setCustomerForm(emptyCustomerForm)
    setCustomerSearch('')
    setProductSearch('')
    setCart([])
    setShippingMethod('tienda')
    setOrderStatus('PAID')
    setOrderSource('whatsapp')
    setCreateError('')
    setCreateOpen(true)
  }

  function selectCustomer(c: any) {
    setCustomerForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      address: c.address || '',
    })
    setCustomerSearch('')
    setShowCustomerDropdown(false)
  }

  function addToCart(product: SimpleProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
    setProductSearch('')
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.productId === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.price ?? 0
  const orderTotal = subtotal + shippingCost

  const filteredProducts = useMemo(() => {
    if (!productSearch) return []
    const q = productSearch.toLowerCase()
    return products
      .filter((p) => p.name.toLowerCase().includes(q) && !cart.some((c) => c.productId === p.id))
      .slice(0, 8)
  }, [productSearch, products, cart])

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return []
    const q = customerSearch.toLowerCase()
    return customers
      .filter((c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      )
      .slice(0, 5)
  }, [customerSearch, customers])

  async function handleCreateOrder() {
    const { name, email, phone, city, address } = customerForm
    if (!name || !email || !phone || !city) {
      setCreateError('Completa los datos del cliente')
      return
    }
    if (cart.length === 0) {
      setCreateError('Agrega al menos un producto')
      return
    }
    setSaving(true)
    setCreateError('')
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerCity: city,
          customerAddress: address,
          shippingMethod,
          status: orderStatus,
          source: orderSource,
          items: cart,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Error creando pedido')
        return
      }
      setCreateOpen(false)
      fetchOrders()
    } catch {
      setCreateError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Fetch products for edit mode (reuse products state)
  useEffect(() => {
    if (!editingItems || products.length > 0) return
    fetch('/api/admin/products?limit=500')
      .then((r) => r.json())
      .then((data) => setProducts((data.products || []).filter((p: SimpleProduct) => p.available)))
  }, [editingItems, products.length])

  function openEditOrder(order: any) {
    setSelected(order)
  }

  function startEditItems() {
    if (!selected) return
    setDetailCart(
      selected.items.map((i: any) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))
    )
    setDetailProductSearch('')
    setEditingItems(true)
  }

  function cancelEditItems() {
    setEditingItems(false)
    setDetailCart([])
    setDetailProductSearch('')
  }

  function addToDetailCart(product: SimpleProduct) {
    setDetailCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
    setDetailProductSearch('')
  }

  function updateDetailQuantity(productId: string, delta: number) {
    setDetailCart((prev) =>
      prev
        .map((i) => i.productId === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  function removeFromDetailCart(productId: string) {
    setDetailCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  async function saveEditItems() {
    if (!selected || detailCart.length === 0) return
    setSavingItems(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selected.id, items: detailCart }),
      })
      const updatedOrder = await res.json()
      setSelected(updatedOrder)
      setEditingItems(false)
      fetchOrders()
    } catch { /* ignore */ } finally {
      setSavingItems(false)
    }
  }

  const filteredDetailProducts = useMemo(() => {
    if (!detailProductSearch) return []
    const q = detailProductSearch.toLowerCase()
    return products
      .filter((p) => p.name.toLowerCase().includes(q) && !detailCart.some((c) => c.productId === p.id))
      .slice(0, 6)
  }, [detailProductSearch, products, detailCart])

  function confirmDelete(order: any) {
    setDeletingOrder(order)
    setDeleteOpen(true)
  }

  async function handleDeleteOrder() {
    if (!deletingOrder) return
    setDeleting(true)
    try {
      await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: deletingOrder.id }),
      })
      setDeleteOpen(false)
      setDeletingOrder(null)
      setSelected(null)
      fetchOrders()
    } catch { /* ignore */ } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">{total} pedidos en total</p>
        </div>
        <Button onClick={openCreateOrder} className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Crear pedido
        </Button>
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
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {orders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-3 cursor-pointer" onClick={() => setSelected(order)}>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </td>
                        <td className="px-5 py-3 cursor-pointer" onClick={() => setSelected(order)}>
                          <ChannelBadge source={order.source} />
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground cursor-pointer" onClick={() => setSelected(order)}>{order.items.length}</td>
                        <td className="px-5 py-3 text-sm font-semibold cursor-pointer" onClick={() => setSelected(order)}>{formatCOP(order.total)}</td>
                        <td className="px-5 py-3 cursor-pointer" onClick={() => setSelected(order)}>
                          <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground cursor-pointer" onClick={() => setSelected(order)}>
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 cursor-pointer" onClick={() => setSelected(order)}>
                          {order.alegraInvoiceId ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <FileText className="mr-1 h-3 w-3" /> #{order.alegraInvoiceId}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditOrder(order)}
                              title="Editar pedido"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => confirmDelete(order)}
                              title="Eliminar pedido"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditingItems(false) } }}>
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
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos</p>
                    {!editingItems ? (
                      <Button variant="ghost" size="xs" onClick={startEditItems} className="gap-1">
                        <Pencil className="h-3 w-3" /> Editar
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="xs" onClick={cancelEditItems} disabled={savingItems}>
                          Cancelar
                        </Button>
                        <Button size="xs" onClick={saveEditItems} disabled={savingItems || detailCart.length === 0} className="gap-1">
                          {savingItems && <Loader2 className="h-3 w-3 animate-spin" />}
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingItems ? (
                    <>
                      {/* Product search */}
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Agregar producto..."
                          value={detailProductSearch}
                          onChange={(e) => setDetailProductSearch(e.target.value)}
                          className="pl-8 h-8 text-sm bg-background border-primary/10"
                        />
                        {filteredDetailProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border border-primary/10 bg-card shadow-lg">
                            {filteredDetailProducts.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => addToDetailCart(p)}
                                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-muted/30"
                              >
                                <p className="text-sm">{p.name}</p>
                                <p className="text-xs font-semibold text-primary">{formatCOP(p.price)}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Editable cart */}
                      <div className="divide-y divide-primary/5 rounded-lg border border-primary/10">
                        {detailCart.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{formatCOP(item.price)} c/u</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button variant="ghost" size="icon-xs" onClick={() => updateDetailQuantity(item.productId, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button variant="ghost" size="icon-xs" onClick={() => updateDetailQuantity(item.productId, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="w-16 text-right text-xs font-medium">{formatCOP(item.price * item.quantity)}</span>
                              <Button variant="ghost" size="icon-xs" onClick={() => removeFromDetailCart(item.productId)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between bg-muted/20 px-3 py-2">
                          <p className="text-sm font-semibold">Subtotal</p>
                          <p className="text-sm font-bold text-primary">
                            {formatCOP(detailCart.reduce((s, i) => s + i.price * i.quantity, 0))}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="divide-y divide-primary/5 rounded-lg border border-primary/10">
                      {selected.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                          <div>
                            <p className="text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium">{formatCOP(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between bg-muted/20 px-4 py-2.5">
                        <p className="text-sm font-semibold">Total</p>
                        <p className="text-sm font-bold text-primary">{formatCOP(selected.total)}</p>
                      </div>
                    </div>
                  )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-primary/10">
          <DialogHeader>
            <DialogTitle>Eliminar pedido</DialogTitle>
            <DialogDescription>
              {deletingOrder && (
                <>
                  ¿Estás seguro de eliminar el pedido <strong>#{deletingOrder.id.slice(-8)}</strong> de <strong>{deletingOrder.customerName}</strong> por <strong>{formatCOP(deletingOrder.total)}</strong>? Esta acción no se puede deshacer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-primary/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear pedido</DialogTitle>
            <DialogDescription>
              Busca un cliente existente o ingresa los datos manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Customer section */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos del cliente</p>

              {/* Customer search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente existente por nombre, email o teléfono..."
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true) }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="pl-9 bg-background border-primary/10"
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-primary/10 bg-card shadow-lg">
                    {filteredCustomers.map((c: any) => (
                      <button
                        key={c.email}
                        onClick={() => selectCustomer(c)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email} · {c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre *</Label>
                  <Input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="bg-background border-primary/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="bg-background border-primary/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Teléfono *</Label>
                  <Input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="3001234567"
                    className="bg-background border-primary/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ciudad *</Label>
                  <Input
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    placeholder="Medellín"
                    className="bg-background border-primary/10"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs">Dirección</Label>
                <Input
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Dirección de envío"
                  className="bg-background border-primary/10"
                />
              </div>
            </div>

            {/* Products section */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos</p>

              {/* Product search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 bg-background border-primary/10"
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-primary/10 bg-card shadow-lg">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
                      >
                        <div>
                          <p className="text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">{formatCOP(p.price)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-primary/10 py-8">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Busca y agrega productos al pedido</p>
                </div>
              ) : (
                <div className="divide-y divide-primary/5 rounded-lg border border-primary/10">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCOP(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="w-20 text-right text-sm font-medium">{formatCOP(item.price * item.quantity)}</span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping, Channel & Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Método de envío</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger className="bg-background border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_OPTIONS.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label} {o.price > 0 ? `(${formatCOP(o.price)})` : '(Gratis)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Canal de venta</Label>
                <Select value={orderSource} onValueChange={setOrderSource}>
                  <SelectTrigger className="bg-background border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Estado del pedido</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger className="bg-background border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="rounded-lg bg-muted/20 p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatCOP(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-primary/10 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCOP(orderTotal)}</span>
                </div>
              </div>
            )}

            {createError && (
              <p className="text-sm text-red-400">{createError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrder} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
