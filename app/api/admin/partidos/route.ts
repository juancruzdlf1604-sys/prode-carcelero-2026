import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'
import { calcularPuntosGrupo } from '@/lib/puntos'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === (process.env.ADMIN_PASSWORD ?? 'carcelero2026')
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, goles_local_real, goles_visitante_real } = await req.json()
  if (!id || goles_local_real === undefined || goles_visitante_real === undefined) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('partidos')
    .update({ goles_local_real, goles_visitante_real, jugado: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch all pronosticos_grupos for this partido
  const { data: pronosticos, error: pronError } = await supabaseAdmin
    .from('pronosticos_grupos')
    .select('participante_id, goles_local, goles_visitante')
    .eq('partido_id', id)

  if (pronError) return NextResponse.json({ error: pronError.message }, { status: 500 })

  if (pronosticos && pronosticos.length > 0) {
    // Delete old puntos for this partido
    await supabaseAdmin.from('puntos_partidos').delete().eq('partido_id', id)

    // Insert new puntos
    const rows = pronosticos.map(pg => ({
      participante_id: pg.participante_id,
      partido_id: id,
      puntos: calcularPuntosGrupo(
        { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante },
        { goles_local_real, goles_visitante_real }
      ),
    }))

    const { error: insertError } = await supabaseAdmin.from('puntos_partidos').insert(rows)
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('partidos')
    .update({ goles_local_real: null, goles_visitante_real: null, jugado: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('puntos_partidos').delete().eq('partido_id', id)

  return NextResponse.json({ ok: true })
}
