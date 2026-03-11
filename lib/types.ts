export interface Category {
  id: string
  alegraId: string | null
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  order: number
  createdAt: Date
}

export interface Product {
  id: string
  alegraId: string | null
  name: string
  slug: string
  description: string | null
  price: number
  priceBulk: string | null
  images: string
  categoryId: string
  category?: Category
  temperament: string | null
  tankMin: number | null
  stock: number
  available: boolean
  featured: boolean
  careLevel: string | null
  tags: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductWithCategory extends Product {
  category: Category
}

export type PriceBulkItem = {
  qty: number
  price: number
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCity: string
  customerAddress: string
  customerId: string | null
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  mpPreferenceId: string | null
  mpPaymentId: string | null
  mpStatus: string | null
  alegraInvoiceId: string | null
  shippingMethod: string | null
  trackingNumber: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface ShippingOption {
  id: string
  label: string
  description: string
  price: number
  estimatedDays?: string
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'tienda',
    label: 'Recoge en tienda',
    description: 'Caldas, Antioquia — Cra 48 #127sur-78',
    price: 0,
    estimatedDays: 'Disponible en horario de atención',
  },
  {
    id: 'domicilio',
    label: 'Domicilio Medellín',
    description: 'Mensajero independiente, mismo día (pedidos antes de las 3pm)',
    price: 20000,
    estimatedDays: 'Mismo día',
  },
  {
    id: 'nacional',
    label: 'Envío nacional',
    description: 'Interrapidísimo, Servientrega o Coordinadora (peces en caja icopor)',
    price: 20000,
    estimatedDays: '1–3 días hábiles · Solo lunes',
  },
]
