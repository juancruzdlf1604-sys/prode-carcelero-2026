import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === (process.env.ADMIN_PASSWORD ?? 'carcelero2026')
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { puesto, nombre, descripcion } = await req.json()
  if (!puesto) return NextResponse.json({ error: 'Falta puesto' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('premios')
    .update({ nombre, descripcion })
    .eq('puesto', puesto)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
