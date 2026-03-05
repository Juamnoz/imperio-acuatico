import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌊 Sembrando base de datos Imperio Acuático...')

  // Categorías
  const categories = [
    { name: 'Peces Ornamentales', slug: 'peces-ornamentales', icon: '🐠', description: 'Amazónicos, tropicales e importados. Todos pre-desparasitados.', order: 1, image: '/images/categories/ornamentales.jpg' },
    { name: 'Cíclidos Africanos', slug: 'ciclidos-africanos', icon: '🐟', description: 'Coloridos habitantes del lago Malawi y Tanganika.', order: 2, image: '/images/categories/africanos.jpg' },
    { name: 'Cíclidos Americanos', slug: 'ciclidos-americanos', icon: '🐡', description: 'Desde discus hasta flowerhorn, para acuaristas apasionados.', order: 3, image: '/images/categories/americanos.jpg' },
    { name: 'Peces Limpiadores', slug: 'peces-limpiadores', icon: '🧹', description: 'Plecostomus, corydoras y más para mantener el acuario limpio.', order: 4, image: '/images/categories/limpiadores.jpg' },
    { name: 'Plantas Acuáticas', slug: 'plantas-acuaticas', icon: '🌿', description: 'Bajo, medio y alto requerimiento. CO2, fertilizantes y sustrato.', order: 5, image: '/images/categories/plantas.jpg' },
    { name: 'Equipos', slug: 'equipos', icon: '⚙️', description: 'Filtros, termostatos, iluminación y accesorios de calidad.', order: 6, image: '/images/categories/equipos.jpg' },
    { name: 'Alimentos', slug: 'alimentos', icon: '🥦', description: 'Alimentos especializados por especie y necesidad nutricional.', order: 7, image: '/images/categories/alimentos.jpg' },
    { name: 'Acuarios y Combos', slug: 'acuarios-combos', icon: '🪸', description: 'Peceras completas y combos armados listos para empezar.', order: 8, image: '/images/categories/acuarios.jpg' },
  ]

  const createdCategories: Record<string, string> = {}

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (!existing) {
      const created = await prisma.category.create({ data: cat })
      createdCategories[cat.slug] = created.id
      console.log(`  ✓ Categoría: ${cat.name}`)
    } else {
      createdCategories[cat.slug] = existing.id
    }
  }

  // Productos
  const products = [
    // Peces Ornamentales
    {
      name: 'Guppy Macho Cola Espada',
      slug: 'guppy-macho-cola-espada',
      description: 'Guppy macho de cola espada multicolor. Fácil de cuidar, ideal para principiantes.',
      price: 4000,
      priceBulk: JSON.stringify([{ qty: 10, price: 30000 }]),
      images: JSON.stringify(['/images/products/guppy.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'pasivo',
      tankMin: 40,
      stock: 50,
      featured: true,
      careLevel: 'fácil',
      tags: JSON.stringify(['guppy', 'tropical', 'colorido']),
    },
    {
      name: 'Molly Balloon Negro',
      slug: 'molly-balloon-negro',
      description: 'Molly balloon en color negro. Pacífico y resistente, perfecto para acuarios comunitarios.',
      price: 5000,
      images: JSON.stringify(['/images/products/molly.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'pasivo',
      tankMin: 40,
      stock: 30,
      featured: false,
      careLevel: 'fácil',
      tags: JSON.stringify(['molly', 'negro', 'comunitario']),
    },
    {
      name: 'Tetras Neón (x5)',
      slug: 'tetras-neon-x5',
      description: 'Lote de 5 tetras neón. Su franja azul eléctrica y roja los hace uno de los peces más populares del mundo.',
      price: 15000,
      images: JSON.stringify(['/images/products/neon.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'pasivo',
      tankMin: 40,
      stock: 40,
      featured: true,
      careLevel: 'fácil',
      tags: JSON.stringify(['tetra', 'neon', 'cardumen']),
    },
    {
      name: 'Betta Macho HM Importado',
      slug: 'betta-macho-hm-importado',
      description: 'Betta halfmoon macho importado. Aletas largas y coloración vibrante. Solo uno por acuario.',
      price: 45000,
      images: JSON.stringify(['/images/products/betta.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'agresivo',
      tankMin: 15,
      stock: 8,
      featured: true,
      careLevel: 'medio',
      tags: JSON.stringify(['betta', 'importado', 'halfmoon']),
    },
    {
      name: 'Ángel Tropical',
      slug: 'angel-tropical',
      description: 'Pez ángel clásico (Pterophyllum scalare). Majestuoso y tranquilo en acuarios plantados.',
      price: 18000,
      images: JSON.stringify(['/images/products/angel.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'semi',
      tankMin: 100,
      stock: 15,
      featured: false,
      careLevel: 'medio',
      tags: JSON.stringify(['angel', 'plantado', 'clasico']),
    },
    {
      name: 'Disco Alemán Blue Diamond',
      slug: 'disco-aleman-blue-diamond',
      description: 'Discus alemán Blue Diamond 8cm+. El rey del acuario. Requiere agua blanda y cálida.',
      price: 70000,
      images: JSON.stringify(['/images/products/disco.jpg']),
      categorySlug: 'peces-ornamentales',
      temperament: 'pasivo',
      tankMin: 200,
      stock: 5,
      featured: true,
      careLevel: 'difícil',
      tags: JSON.stringify(['discus', 'aleman', 'premium']),
    },
    // Cíclidos Africanos
    {
      name: 'Aulonocara (Pavo Real)',
      slug: 'aulonocara-pavo-real',
      description: 'Cíclido africano Aulonocara. Coloración azul y amarillo espectacular. Lago Malawi.',
      price: 25000,
      images: JSON.stringify(['/images/products/aulonocara.jpg']),
      categorySlug: 'ciclidos-africanos',
      temperament: 'semi',
      tankMin: 200,
      stock: 12,
      featured: true,
      careLevel: 'medio',
      tags: JSON.stringify(['aulonocara', 'malawi', 'africano']),
    },
    {
      name: 'Pseudotropheus Zebra',
      slug: 'pseudotropheus-zebra',
      description: 'Mbuna clásico del lago Malawi. Rayas azules y negras. Requiere acuario de especie.',
      price: 18000,
      images: JSON.stringify(['/images/products/zebra.jpg']),
      categorySlug: 'ciclidos-africanos',
      temperament: 'agresivo',
      tankMin: 150,
      stock: 20,
      featured: false,
      careLevel: 'medio',
      tags: JSON.stringify(['mbuna', 'zebra', 'malawi']),
    },
    {
      name: 'Frontosa (6 bandas)',
      slug: 'frontosa-6-bandas',
      description: 'Cyphotilapia frontosa 6 bandas del lago Tanganika. Imponente y longevo.',
      price: 85000,
      images: JSON.stringify(['/images/products/frontosa.jpg']),
      categorySlug: 'ciclidos-africanos',
      temperament: 'semi',
      tankMin: 400,
      stock: 4,
      featured: true,
      careLevel: 'difícil',
      tags: JSON.stringify(['frontosa', 'tanganika', 'premium']),
    },
    // Cíclidos Americanos
    {
      name: 'Flowerhorn Tailand',
      slug: 'flowerhorn-tailand',
      description: 'Flowerhorn tailandés con cabeza (kok) pronunciada. Muy interactivo con su dueño.',
      price: 80000,
      images: JSON.stringify(['/images/products/flowerhorn.jpg']),
      categorySlug: 'ciclidos-americanos',
      temperament: 'agresivo',
      tankMin: 300,
      stock: 3,
      featured: true,
      careLevel: 'medio',
      tags: JSON.stringify(['flowerhorn', 'kok', 'americano']),
    },
    {
      name: 'Jack Dempsey Eléctrico',
      slug: 'jack-dempsey-electrico',
      description: 'Variedad azul eléctrico del clásico Jack Dempsey. Coloración neon impresionante.',
      price: 45000,
      images: JSON.stringify(['/images/products/jackdempsey.jpg']),
      categorySlug: 'ciclidos-americanos',
      temperament: 'agresivo',
      tankMin: 200,
      stock: 6,
      featured: false,
      careLevel: 'medio',
      tags: JSON.stringify(['jackdempsey', 'electrico', 'americano']),
    },
    // Peces Limpiadores
    {
      name: 'Pleco Común',
      slug: 'pleco-comun',
      description: 'Hypostomus plecostomus. El limpiador más popular. Controla algas en acuarios grandes.',
      price: 8000,
      images: JSON.stringify(['/images/products/pleco.jpg']),
      categorySlug: 'peces-limpiadores',
      temperament: 'pasivo',
      tankMin: 100,
      stock: 25,
      featured: false,
      careLevel: 'fácil',
      tags: JSON.stringify(['pleco', 'algas', 'limpiador']),
    },
    {
      name: 'Corydoras Panda (x3)',
      slug: 'corydoras-panda-x3',
      description: 'Lote de 3 corydoras panda. Limpian el fondo buscando restos de comida.',
      price: 18000,
      images: JSON.stringify(['/images/products/corydoras.jpg']),
      categorySlug: 'peces-limpiadores',
      temperament: 'pasivo',
      tankMin: 40,
      stock: 20,
      featured: true,
      careLevel: 'fácil',
      tags: JSON.stringify(['corydoras', 'panda', 'fondo']),
    },
    // Plantas
    {
      name: 'Anubias Nana',
      slug: 'anubias-nana',
      description: 'Planta de bajo requerimiento luminoso. Ideal para principiantes. Raíz expuesta en troncos.',
      price: 12000,
      images: JSON.stringify(['/images/products/anubias.jpg']),
      categorySlug: 'plantas-acuaticas',
      stock: 30,
      featured: true,
      careLevel: 'fácil',
      tags: JSON.stringify(['planta', 'bajo-requerimiento', 'anubias']),
    },
    {
      name: 'Microsorum Pteropus (Java Fern)',
      slug: 'java-fern',
      description: 'Helecho de Java. No necesita sustrato, crece anclado en troncos y rocas.',
      price: 10000,
      images: JSON.stringify(['/images/products/javafern.jpg']),
      categorySlug: 'plantas-acuaticas',
      stock: 25,
      featured: false,
      careLevel: 'fácil',
      tags: JSON.stringify(['planta', 'java', 'facil']),
    },
    // Equipos
    {
      name: 'Filtro Resun Hang On 300L/h',
      slug: 'filtro-resun-hang-on-300',
      description: 'Filtro colgante Resun para acuarios hasta 80L. Silencioso y eficiente. Garantía 3 meses.',
      price: 45000,
      images: JSON.stringify(['/images/products/filtro-resun.jpg']),
      categorySlug: 'equipos',
      stock: 10,
      featured: true,
      careLevel: null,
      tags: JSON.stringify(['filtro', 'resun', 'hang-on']),
    },
    {
      name: 'Termostato Resun 200W',
      slug: 'termostato-resun-200w',
      description: 'Calentador con termostato Resun 200W para acuarios hasta 100L. Garantía 3 meses.',
      price: 38000,
      images: JSON.stringify(['/images/products/termostato.jpg']),
      categorySlug: 'equipos',
      stock: 8,
      featured: false,
      careLevel: null,
      tags: JSON.stringify(['termostato', 'calentador', 'resun']),
    },
    // Alimentos
    {
      name: 'Alimento Premium Betta 30g',
      slug: 'alimento-premium-betta-30g',
      description: 'Pellets flotantes especiales para bettas. Alta proteína, realza el color.',
      price: 15000,
      images: JSON.stringify(['/images/products/alimento-betta.jpg']),
      categorySlug: 'alimentos',
      stock: 20,
      featured: false,
      careLevel: null,
      tags: JSON.stringify(['alimento', 'betta', 'pellet']),
    },
    {
      name: 'Lombriz de Sangre Liofilizada 10g',
      slug: 'lombriz-sangre-liofilizada-10g',
      description: 'Bloodworm liofilizada. Ideal para cíclidos, bettas y peces carnívoros.',
      price: 12000,
      images: JSON.stringify(['/images/products/bloodworm.jpg']),
      categorySlug: 'alimentos',
      stock: 25,
      featured: false,
      careLevel: null,
      tags: JSON.stringify(['alimento', 'bloodworm', 'carnivoro']),
    },
    // Acuarios
    {
      name: 'Combo Acuario 60L Completo',
      slug: 'combo-acuario-60l',
      description: 'Acuario 60L + filtro + termostato + iluminación + sustrato. Listo para llenar.',
      price: 280000,
      images: JSON.stringify(['/images/products/combo-60l.jpg']),
      categorySlug: 'acuarios-combos',
      stock: 5,
      featured: true,
      careLevel: null,
      tags: JSON.stringify(['combo', 'acuario', 'principiante']),
    },
  ]

  for (const product of products) {
    const { categorySlug, ...data } = product
    const categoryId = createdCategories[categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠️ Categoría no encontrada: ${categorySlug}`)
      continue
    }

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (!existing) {
      await prisma.product.create({ data: { ...data, categoryId } })
      console.log(`  ✓ Producto: ${data.name}`)
    }
  }

  // Blog posts de ejemplo
  const posts = [
    {
      title: 'Guía completa para aclimatar peces nuevos',
      slug: 'guia-aclimatar-peces',
      excerpt: 'El proceso de aclimatación es clave para que tu pez nuevo llegue sano y se adapte bien al acuario.',
      content: `# Cómo aclimatar tus peces correctamente

Cuando llevas un pez nuevo a casa, el proceso de aclimatación es fundamental para evitar el estrés y la mortalidad.

## El método de Imperio Acuático

1. **Flotar la bolsa**: Coloca la bolsa cerrada en el acuario durante 15 minutos para igualar temperaturas.
2. **Mezclar el agua**: Abre la bolsa y añade poco a poco agua del acuario cada 5 minutos durante 15 minutos más.
3. **Liberar el pez**: Con una red, transfiere el pez al acuario sin añadir el agua de la bolsa.

## ¿Por qué no añadir el agua de la bolsa?

El agua del transporte puede contener amoniaco y bacterias que no quieres en tu acuario.

Todos nuestros peces llegan **pre-desparasitados** para mayor seguridad.`,
      published: true,
    },
    {
      title: '10 peces perfectos para principiantes',
      slug: '10-peces-para-principiantes',
      excerpt: 'Si estás comenzando en el mundo del acuarismo, estos son los peces más resistentes y fáciles de cuidar.',
      content: `# Los 10 mejores peces para principiantes

El acuarismo puede parecer intimidante al principio, pero con los peces correctos la experiencia es gratificante.

## Top 10

1. **Guppy** — Resistente, colorido y fácil de reproducir.
2. **Molly** — Aguanta variaciones de agua y es muy pacífico.
3. **Tetra Neón** — En cardúmenes son un espectáculo.
4. **Corydoras** — Limpian el fondo y son sociables.
5. **Pleco Común** — El mejor aliado contra las algas.
6. **Platy** — Similar al molly, muy robusto.
7. **Espada (Xiphophorus)** — Colorido y activo.
8. **Danio Cebra** — Muy activo y resistente.
9. **Betta** — Solo uno por acuario, pero impactante.
10. **Goldfish** — El clásico de los clásicos.

En Imperio Acuático tenemos todos estos disponibles. ¡Visítanos!`,
      published: true,
    },
  ]

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (!existing) {
      await prisma.blogPost.create({ data: post })
      console.log(`  ✓ Blog post: ${post.title}`)
    }
  }

  console.log('\n✅ Base de datos sembrada exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
