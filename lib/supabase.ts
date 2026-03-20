import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const STORAGE_BUCKET = 'agent-images'

export function getProductsPath() {
  const agentId = process.env.LISA_AGENT_ID || ''
  return `rooms/${agentId}/products`
}

export function getPublicUrl(filePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`
}
