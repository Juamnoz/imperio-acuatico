import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name) || '.jpg'
      const safeName = file.name
        .replace(ext, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const filename = `${safeName}-${Date.now()}${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      urls.push(`/uploads/products/${filename}`)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivos' }, { status: 500 })
  }
}
