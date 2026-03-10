'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Search, ChevronLeft, ChevronRight, Package,
  Star, Loader2, Check, ImagePlus, X, GripVertical,
  Upload, Trash2, Eye, EyeOff, ArrowLeft,
  Save, MoreHorizontal, ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function parseImages(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}

// ─── Product Editor (Shopify-style) ───

function ProductEditor({
  product,
  categories,
  onSave,
  onClose,
}: {
  product: any
  categories: any[]
  onSave: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    available: product.available,
    featured: product.featured,
    categoryId: product.categoryId,
    temperament: product.temperament || '',
    careLevel: product.careLevel || '',
    tankMin: product.tankMin || 0,
    tags: product.tags || '[]',
  })
  const [images, setImages] = useState<string[]>(parseImages(product.images))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('files', f))

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.urls) {
        setImages((prev) => [...prev, ...data.urls])
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        ...form,
        images: JSON.stringify(images),
      }),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a productos
        </button>
        <div className="flex items-center gap-2">
          {product.alegraId && (
            <Badge variant="outline" className="border-primary/20 text-xs">
              Alegra #{product.alegraId}
            </Badge>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title & Description */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Título del producto
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="border-primary/10 bg-muted/20 text-lg font-semibold"
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-primary/10 bg-muted/20 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-primary/30 placeholder:text-muted-foreground/40"
                  placeholder="Describe el producto, cuidados, compatibilidad, etc..."
                />
                <p className="mt-1 text-[11px] text-muted-foreground/50">
                  {form.description.length} caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Images — Shopify style */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Imágenes
            </label>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => { e.preventDefault() }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (dragIndex !== null && dragIndex !== i) moveImage(dragIndex, i)
                      setDragIndex(null)
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      i === 0 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-primary/10'
                    } ${dragIndex === i ? 'opacity-50' : ''}`}
                  >
                    <Image
                      src={url}
                      alt={`Imagen ${i + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo-white.png' }}
                    />

                    {/* Cover badge */}
                    {i === 0 && (
                      <div className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                        PORTADA
                      </div>
                    )}

                    {/* Overlay actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="cursor-grab text-white/70 hover:text-white" title="Arrastrar para reordenar">
                        <GripVertical className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removeImage(i)}
                        className="rounded-full bg-red-500/80 p-1.5 text-white transition-colors hover:bg-red-500"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
              }`}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <div className="mb-2 rounded-full bg-primary/10 p-3">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">
                    {images.length === 0 ? 'Agregar imágenes' : 'Agregar más imágenes'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Arrastra y suelta o haz clic para seleccionar
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />

            {/* Paste URL */}
            <div className="mt-3">
              <ImageUrlInput onAdd={(url) => setImages((prev) => [...prev, url])} />
            </div>
          </div>
        </div>

        {/* Right column — Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estado
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Visible en tienda</span>
                <Switch checked={form.available} onCheckedChange={(v) => update('available', v)} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Producto destacado</span>
                <Switch checked={form.featured} onCheckedChange={(v) => update('featured', v)} />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Precio e inventario
            </label>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Precio (COP)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', parseInt(e.target.value) || 0)}
                  className="border-primary/10 bg-muted/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Stock</label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update('stock', parseInt(e.target.value) || 0)}
                  className="border-primary/10 bg-muted/20"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organización
            </label>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Categoría</label>
                <Select value={form.categoryId} onValueChange={(v) => update('categoryId', v)}>
                  <SelectTrigger className="border-primary/10 bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Temperamento</label>
                <Select value={form.temperament || 'none'} onValueChange={(v) => update('temperament', v === 'none' ? null : v)}>
                  <SelectTrigger className="border-primary/10 bg-muted/20">
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    <SelectItem value="pasivo">Pacífico</SelectItem>
                    <SelectItem value="semi">Semi-agresivo</SelectItem>
                    <SelectItem value="agresivo">Agresivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Nivel de cuidado</label>
                <Select value={form.careLevel || 'none'} onValueChange={(v) => update('careLevel', v === 'none' ? null : v)}>
                  <SelectTrigger className="border-primary/10 bg-muted/20">
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    <SelectItem value="fácil">Fácil</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="difícil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Acuario mínimo (litros)</label>
                <Input
                  type="number"
                  value={form.tankMin}
                  onChange={(e) => update('tankMin', parseInt(e.target.value) || 0)}
                  className="border-primary/10 bg-muted/20"
                  placeholder="0 = no aplica"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-primary/10 bg-card p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vista previa
            </label>
            <div className="overflow-hidden rounded-lg border border-primary/10">
              <div className="relative aspect-[4/3] bg-muted">
                {images[0] ? (
                  <Image src={images[0]} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/30">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-primary">{categories.find((c) => c.id === form.categoryId)?.name}</p>
                <p className="text-sm font-semibold">{form.name || 'Sin título'}</p>
                <p className="mt-1 text-sm font-bold">{formatCOP(form.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Image URL Input ───

function ImageUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
      >
        + Agregar imagen por URL
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 border-primary/10 bg-muted/20 text-xs"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && url.trim()) {
            onAdd(url.trim())
            setUrl('')
            setOpen(false)
          }
        }}
      />
      <button
        onClick={() => { if (url.trim()) { onAdd(url.trim()); setUrl(''); setOpen(false) } }}
        className="rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
      >
        Agregar
      </button>
      <button
        onClick={() => { setUrl(''); setOpen(false) }}
        className="rounded-lg border border-primary/10 px-2 text-muted-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Product List ───

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availableFilter, setAvailableFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [imageFilter, setImageFilter] = useState('all') // all | with | without
  const [perPage, setPerPage] = useState(20)
  const quickUploadRef = useRef<HTMLInputElement>(null)
  const [quickUploadTarget, setQuickUploadTarget] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(perPage) })
    if (search) params.set('q', search)
    if (categoryFilter !== 'all') params.set('category', categoryFilter)
    if (availableFilter !== 'all') params.set('available', availableFilter)
    if (imageFilter === 'with') params.set('hasImage', 'true')
    if (imageFilter === 'without') params.set('hasImage', 'false')

    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [page, perPage, search, categoryFilter, availableFilter, imageFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories)
  }, [])

  async function quickUpload(productId: string, files: FileList) {
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('files', f))
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.urls?.length) {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, images: JSON.stringify(data.urls) }),
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, images: JSON.stringify(data.urls) } : p))
      )
    }
    setQuickUploadTarget(null)
  }

  async function quickToggle(productId: string, field: 'available' | 'featured', value: boolean) {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, [field]: value }),
    })
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p)))
  }

  // ─── Editor mode ───
  if (editing) {
    return (
      <ProductEditor
        product={editing}
        categories={categories}
        onSave={() => { setEditing(null); fetchProducts() }}
        onClose={() => setEditing(null)}
      />
    )
  }

  // ─── List mode ───
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Productos</h1>
        <p className="text-sm text-muted-foreground">{total} productos sincronizados desde Alegra</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-card border-primary/10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-primary/10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availableFilter} onValueChange={(v) => { setAvailableFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40 bg-card border-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Disponibilidad</SelectItem>
            <SelectItem value="true">Disponible</SelectItem>
            <SelectItem value="false">Agotado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={imageFilter} onValueChange={(v) => { setImageFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40 bg-card border-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fotos</SelectItem>
            <SelectItem value="without">Sin foto</SelectItem>
            <SelectItem value="with">Con foto</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-32 bg-card border-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 por pág.</SelectItem>
            <SelectItem value="100">100 por pág.</SelectItem>
            <SelectItem value="1000">1000 por pág.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hidden file input for quick uploads */}
      <input
        ref={quickUploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && quickUploadTarget) {
            quickUpload(quickUploadTarget, e.target.files)
          }
          e.target.value = ''
        }}
      />

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No se encontraron productos</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 text-left">
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Categoría</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Visible</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {products.map((product) => {
                const imgs = parseImages(product.images)
                const thumb = imgs[0]
                return (
                  <tr
                    key={product.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setEditing(product)}
                  >
                    <td className="px-4 py-2.5" onClick={(e) => {
                      if (!thumb) {
                        e.stopPropagation()
                        setQuickUploadTarget(product.id)
                        quickUploadRef.current?.click()
                      }
                    }}>
                      <div className={`relative h-10 w-10 overflow-hidden rounded-lg border bg-muted transition-all ${
                        thumb ? 'border-primary/10' : 'border-dashed border-primary/25 cursor-pointer hover:border-primary/50 hover:bg-primary/5'
                      }`}>
                        {thumb ? (
                          <Image src={thumb} alt="" fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-primary/30 hover:text-primary/60">
                            <Upload className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium">{product.name}</p>
                      {product.alegraId && (
                        <p className="text-[10px] text-muted-foreground/50">Alegra #{product.alegraId}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-2.5 md:table-cell">
                      <span className="text-xs text-muted-foreground">{product.category?.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold">{formatCOP(product.price)}</td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-xs text-muted-foreground">
                          {product.stock > 0 ? `${product.stock}` : 'Agotado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={product.available}
                        onCheckedChange={(v) => quickToggle(product.id, 'available', v)}
                        className="scale-75"
                      />
                    </td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => quickToggle(product.id, 'featured', !product.featured)}
                        className={`rounded p-1 transition-colors ${product.featured ? 'text-amber-400' : 'text-muted-foreground/20 hover:text-amber-400/60'}`}
                      >
                        <Star className="h-4 w-4" fill={product.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total > 0
            ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} de ${total} productos`
            : 'Sin resultados'}
        </p>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-primary/10 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">{page} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="rounded-lg border border-primary/10 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
