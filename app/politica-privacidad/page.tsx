import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de Imperio Acuático.',
}

export default function PoliticaPrivacidad() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-foreground mb-8">
        Política de Privacidad
      </h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">
        <p>
          <strong>Última actualización:</strong> Marzo 2026
        </p>

        <p>
          En <strong>Imperio Acuático</strong> (NIT pendiente), con domicilio en Cra 48 #127sur-78, El Olaya, Caldas, Antioquia, Colombia, nos comprometemos a proteger la privacidad de nuestros usuarios y clientes.
        </p>

        <h2>1. Información que Recopilamos</h2>
        <p>
          Recopilamos la siguiente información cuando realizas una compra o te registras en nuestro sitio:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nombre completo</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono / WhatsApp</li>
          <li>Dirección de envío (ciudad, departamento, dirección)</li>
          <li>Información de pago (procesada de forma segura por MercadoPago)</li>
        </ul>

        <h2>2. Uso de la Información</h2>
        <p>Utilizamos tu información para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Procesar y enviar tus pedidos</li>
          <li>Enviar confirmaciones de compra por correo electrónico</li>
          <li>Comunicarnos contigo sobre el estado de tu pedido</li>
          <li>Mejorar nuestros productos y servicios</li>
          <li>Cumplir con obligaciones legales y tributarias</li>
        </ul>

        <h2>3. Protección de Datos</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración. Los pagos son procesados de forma segura por <strong>MercadoPago</strong>, y no almacenamos datos de tarjetas de crédito en nuestros servidores.
        </p>

        <h2>4. Compartir Información</h2>
        <p>
          No vendemos ni compartimos tu información personal con terceros, excepto:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Empresas de transporte para realizar el envío de tu pedido</li>
          <li>MercadoPago como procesador de pagos</li>
          <li>Autoridades competentes cuando sea requerido por ley</li>
        </ul>

        <h2>5. Cookies</h2>
        <p>
          Nuestro sitio utiliza cookies esenciales para el funcionamiento del carrito de compras y la sesión de usuario. No utilizamos cookies de rastreo publicitario.
        </p>

        <h2>6. Derechos del Titular</h2>
        <p>
          De acuerdo con la Ley 1581 de 2012 de Colombia, tienes derecho a:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Conocer, actualizar y rectificar tus datos personales</li>
          <li>Solicitar la eliminación de tus datos</li>
          <li>Revocar la autorización para el tratamiento de tus datos</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
        </ul>

        <h2>7. Contacto</h2>
        <p>
          Para ejercer tus derechos o resolver dudas sobre esta política, puedes contactarnos:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>WhatsApp: <a href="https://wa.me/573027471832" className="text-primary hover:underline">302 747 1832</a></li>
          <li>Correo: <a href="mailto:natyjaramillo81@gmail.com" className="text-primary hover:underline">natyjaramillo81@gmail.com</a></li>
          <li>Dirección: Cra 48 #127sur-78, El Olaya, Caldas, Antioquia</li>
        </ul>
      </div>
    </div>
  )
}
