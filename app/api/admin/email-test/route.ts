import { NextResponse } from 'next/server'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST() {
  try {
    const result = await sendOrderConfirmation({
      orderId: 'test-abc12345',
      customerName: 'Cliente de Prueba',
      customerEmail: 'juamnoze@gmail.com',
      customerPhone: '3027471832',
      customerCity: 'Caldas, Antioquia',
      customerAddress: 'Cra 48 #127sur-78',
      items: [
        { name: 'Betta Halfmoon Macho', quantity: 2, price: 25000 },
        { name: 'Guppy Cobra Macho', quantity: 5, price: 8000 },
        { name: 'Alimento Sera Bettagran 50ml', quantity: 1, price: 32000 },
      ],
      subtotal: 122000,
      shipping: 0,
      shippingMethod: 'tienda',
      total: 122000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ error: 'Error sending test email' }, { status: 500 })
  }
}
