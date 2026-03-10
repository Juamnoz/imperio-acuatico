import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de la tienda en línea Imperio Acuático.',
}

export default function TerminosCondiciones() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-foreground mb-8">
        Términos y Condiciones
      </h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">
        <p>
          <strong>Última actualización:</strong> Marzo 2026
        </p>

        <p>
          Bienvenido a <strong>Imperio Acuático</strong>. Al acceder y utilizar este sitio web (imperioacuatico.co), aceptas los siguientes términos y condiciones.
        </p>

        <h2>1. Información General</h2>
        <p>
          Imperio Acuático es una tienda especializada en peces ornamentales, plantas acuáticas y accesorios para acuarios, ubicada en Caldas, Antioquia, Colombia. Realizamos envíos a todo el territorio colombiano.
        </p>

        <h2>2. Productos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Todos los peces son <strong>pre-desparasitados</strong> antes del envío.</li>
          <li>Las imágenes de los productos son referenciales. Dado que se trata de seres vivos, pueden existir variaciones naturales en color, tamaño y patrón.</li>
          <li>Los precios están expresados en <strong>Pesos Colombianos (COP)</strong> e incluyen IVA cuando aplique.</li>
          <li>La disponibilidad de productos está sujeta al stock actual.</li>
        </ul>

        <h2>3. Proceso de Compra</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Selecciona los productos y agrégalos al carrito.</li>
          <li>Completa tus datos de envío.</li>
          <li>Realiza el pago a través de <strong>MercadoPago</strong> (tarjeta de crédito, PSE, Nequi, efectivo).</li>
          <li>Recibirás una confirmación por correo electrónico con el resumen de tu pedido.</li>
        </ul>

        <h2>4. Envíos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Los envíos se realizan a todo Colombia a través de transportadoras especializadas en animales vivos.</li>
          <li>El costo de envío varía según la ciudad de destino y se calcula al momento de la compra.</li>
          <li>Los tiempos de entrega estimados son de 1 a 3 días hábiles para las principales ciudades.</li>
          <li>Los pedidos se preparan y despachan de lunes a sábado.</li>
        </ul>

        <h2>5. Garantía de Llegada</h2>
        <p>
          Garantizamos que los peces lleguen <strong>vivos y en buen estado</strong>. En caso de que un pez llegue muerto o en malas condiciones:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Debes notificarnos dentro de las <strong>2 horas siguientes</strong> a la recepción.</li>
          <li>Envía evidencia fotográfica o en video al WhatsApp <a href="https://wa.me/573027471832" className="text-primary hover:underline">302 747 1832</a>.</li>
          <li>Procederemos con el reenvío o reembolso según el caso.</li>
          <li>Esta garantía no aplica si se incumplen las instrucciones de aclimatación proporcionadas.</li>
        </ul>

        <h2>6. Devoluciones y Reembolsos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Por tratarse de seres vivos, no se aceptan devoluciones por cambio de opinión.</li>
          <li>Los reembolsos aplican únicamente en caso de incumplimiento de la garantía de llegada.</li>
          <li>Para accesorios y equipos, aceptamos devoluciones dentro de los primeros 5 días si el producto presenta defectos de fábrica y no ha sido usado.</li>
        </ul>

        <h2>7. Pagos</h2>
        <p>
          Los pagos se procesan de forma segura a través de <strong>MercadoPago</strong>. Aceptamos:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tarjetas de crédito y débito</li>
          <li>PSE (transferencia bancaria)</li>
          <li>Nequi</li>
          <li>Efectivo (puntos de pago Efecty, Baloto)</li>
        </ul>

        <h2>8. Propiedad Intelectual</h2>
        <p>
          Todo el contenido de este sitio (textos, imágenes, logotipos, diseño) es propiedad de Imperio Acuático y está protegido por las leyes de propiedad intelectual de Colombia. Queda prohibida su reproducción sin autorización.
        </p>

        <h2>9. Limitación de Responsabilidad</h2>
        <p>
          Imperio Acuático no se hace responsable por daños indirectos derivados del uso de los productos adquiridos. La responsabilidad se limita al valor del producto comprado.
        </p>

        <h2>10. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización.
        </p>

        <h2>11. Contacto</h2>
        <p>Para cualquier consulta sobre estos términos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>WhatsApp: <a href="https://wa.me/573027471832" className="text-primary hover:underline">302 747 1832</a></li>
          <li>Correo: <a href="mailto:natyjaramillo81@gmail.com" className="text-primary hover:underline">natyjaramillo81@gmail.com</a></li>
          <li>Dirección: Cra 48 #127sur-78, El Olaya, Caldas, Antioquia</li>
        </ul>

        <h2>12. Legislación Aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales de Medellín, Antioquia.
        </p>
      </div>
    </div>
  )
}
