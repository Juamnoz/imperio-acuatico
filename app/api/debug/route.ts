import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ?? 'NOT SET'
    const masked = url.replace(/:([^@]+)@/, ':***@')
    const pool = new Pool({ connectionString: url })
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
    await pool.end()
    return NextResponse.json({ url: masked, tables: tables.rows.map((r: { tablename: string }) => r.tablename) })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) })
  }
}
