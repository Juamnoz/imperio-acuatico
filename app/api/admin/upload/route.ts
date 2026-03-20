import { NextRequest, NextResponse } from 'next/server'
import { supabase, STORAGE_BUCKET, getProductsPath, getPublicUrl } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = (file.name.match(/\.\w+$/) || ['.jpg'])[0]
      const safeName = file.name
        .replace(/\.\w+$/, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const filename = `${safeName}-${Date.now()}${ext}`
      const storagePath = `${getProductsPath()}/${filename}`

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: `Error al subir ${file.name}: ${error.message}` }, { status: 500 })
      }

      urls.push(getPublicUrl(storagePath))
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivos' }, { status: 500 })
  }
}
