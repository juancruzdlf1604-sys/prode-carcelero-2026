import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === (process.env.ADMIN_PASSWORD ?? 'carcelero2026')
}

// Toggle pago_confirmado
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, pago_confirmado } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('participantes')
    .update({ pago_confirmado })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Eliminar participante y todos sus datos
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  // Eliminar registros relacionados primero (si no hay CASCADE en el schema)
  await supabaseAdmin.from('pronosticos_grupos').delete().eq('participante_id', id)
  await supabaseAdmin.from('pronosticos_eliminatorias').delete().eq('participante_id', id)
  await supabaseAdmin.from('bonus').delete().eq('participante_id', id)

  const { error } = await supabaseAdmin.from('participantes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
