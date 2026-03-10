/* ─── E-commerce tracking events ─── */

// Extend window for pixel globals
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    ttq?: { track: (...args: unknown[]) => void; page: () => void }
  }
}

interface ProductEvent {
  id: string
  name: string
  price: number
  category?: string
  quantity?: number
}

interface PurchaseEvent {
  orderId: string
  total: number
  items: ProductEvent[]
}

/** View product detail */
export function trackViewContent(product: ProductEvent) {
  window.gtag?.('event', 'view_item', {
    currency: 'COP',
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }],
  })

  window.fbq?.('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: 'COP',
  })

  window.ttq?.track('ViewContent', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'COP',
  })
}

/** Add to cart */
export function trackAddToCart(product: ProductEvent) {
  const qty = product.quantity ?? 1

  window.gtag?.('event', 'add_to_cart', {
    currency: 'COP',
    value: product.price * qty,
    items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: qty }],
  })

  window.fbq?.('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * qty,
    currency: 'COP',
  })

  window.ttq?.track('AddToCart', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: product.price * qty,
    currency: 'COP',
    quantity: qty,
  })
}

/** Initiate checkout */
export function trackInitiateCheckout(total: number, items: ProductEvent[]) {
  window.gtag?.('event', 'begin_checkout', {
    currency: 'COP',
    value: total,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity ?? 1 })),
  })

  window.fbq?.('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.id),
    num_items: items.length,
    value: total,
    currency: 'COP',
  })

  window.ttq?.track('InitiateCheckout', {
    content_ids: items.map((i) => i.id),
    value: total,
    currency: 'COP',
  })
}

/** Purchase complete */
export function trackPurchase(data: PurchaseEvent) {
  window.gtag?.('event', 'purchase', {
    transaction_id: data.orderId,
    currency: 'COP',
    value: data.total,
    items: data.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity ?? 1 })),
  })

  window.fbq?.('track', 'Purchase', {
    content_ids: data.items.map((i) => i.id),
    content_type: 'product',
    num_items: data.items.length,
    value: data.total,
    currency: 'COP',
  })

  window.ttq?.track('CompletePayment', {
    content_ids: data.items.map((i) => i.id),
    value: data.total,
    currency: 'COP',
  })
}
