import { MercadoPagoConfig, Preference } from 'mercadopago'
import type { CartItem } from './types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function createPreference(
  orderId: string,
  items: CartItem[],
  shipping: number
) {
  const preference = new Preference(client)

  const mpItems = items.map((item) => ({
    id: item.productId,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: 'COP',
  }))

  if (shipping > 0) {
    mpItems.push({
      id: 'shipping',
      title: 'Costo de envío',
      quantity: 1,
      unit_price: shipping,
      currency_id: 'COP',
    })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

  const result = await preference.create({
    body: {
      items: mpItems,
      back_urls: {
        success: `${baseUrl}/checkout/exito?order=${orderId}`,
        failure: `${baseUrl}/checkout/fallo?order=${orderId}`,
        pending: `${baseUrl}/checkout/pendiente?order=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhook/mp`,
      external_reference: orderId,
      statement_descriptor: 'IMPERIO ACUATICO',
    },
  })

  return result
}
