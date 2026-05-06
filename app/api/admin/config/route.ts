import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'

function isAdmin(req: NextRequest) {
  const pass = req.headers.get('x-admin-password')
  return pass === (process.env.ADMIN_PASSWORD ?? 'carcelero2026')
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { clave, valor } = await req.json()
  if (!clave || valor === undefined) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('configuracion')
    .update({ valor })
    .eq('clave', clave)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
