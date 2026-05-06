import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'
import { mapTeamName, normalizeTeamName } from '@/lib/team-names'

const FOOTBALL_API_URL = 'https://api.football-data.org/v4/competitions/WC/matches'

// Accepts: Vercel cron (Authorization: Bearer CRON_SECRET) or admin manual trigger (X-Admin-Password)
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const adminKey = req.headers.get('x-admin-password')

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
  if (adminKey === (process.env.ADMIN_PASSWORD ?? 'carcelero2026')) return true
  return false
}

interface FootballMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  homeTeam: { id: number; name: string | null } | null
  awayTeam: { id: number; name: string | null } | null
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY no configurada' }, { status: 500 })
  }

  try {
    // 1. Fetch from football-data.org
    const apiRes = await fetch(FOOTBALL_API_URL, {
      headers: { 'X-Auth-Token': apiKey },
      next: { revalidate: 0 },
    })

    if (!apiRes.ok) {
      const body = await apiRes.text()
      return NextResponse.json(
        { error: `API error ${apiRes.status}: ${body.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const apiData = await apiRes.json()
    const matches: FootballMatch[] = apiData.matches ?? []

    // 2. Fetch all partidos from DB once
    const { data: partidos, error: dbErr } = await supabaseAdmin
      .from('partidos')
      .select('id, equipo_local, equipo_visitante, jugado, goles_local_real, goles_visitante_real, status')

    if (dbErr || !partidos) {
      return NextResponse.json({ error: `Error DB: ${dbErr?.message}` }, { status: 500 })
    }

    // 3. Build lookup: normalize(local)|normalize(visitante) → partido
    type PartidoDB = {
      id: number
      equipo_local: string
      equipo_visitante: string
      jugado: boolean
      goles_local_real: number | null
      goles_visitante_real: number | null
      status: string | null
    }

    const lookup = new Map<string, PartidoDB>()
    for (const p of partidos as PartidoDB[]) {
      const key = `${normalizeTeamName(p.equipo_local)}|${normalizeTeamName(p.equipo_visitante)}`
      lookup.set(key, p)
    }

    // 4. Process each API match
    const actualizados: Array<{ id: number; partido: string; resultado: string }> = []
    const errores: string[] = []
    let sinCambios = 0

    for (const match of matches) {
      // Skip placeholder knockout matches where teams aren't defined yet
      if (!match.homeTeam?.name || !match.awayTeam?.name) continue

      const apiLocal = mapTeamName(match.homeTeam.name)
      const apiVisitante = mapTeamName(match.awayTeam.name)
      const normalKey = `${normalizeTeamName(apiLocal)}|${normalizeTeamName(apiVisitante)}`

      const partido = lookup.get(normalKey)
      if (!partido) {
        // Try reversed (API sometimes has home/away swapped vs our data)
        const reverseKey = `${normalizeTeamName(apiVisitante)}|${normalizeTeamName(apiLocal)}`
        const reversed = lookup.get(reverseKey)
        if (!reversed) {
          errores.push(`Sin mapeo: ${match.homeTeam.name} vs ${match.awayTeam.name}`)
        }
        continue
      }

      const newStatus = match.status // 'SCHEDULED','TIMED','IN_PLAY','PAUSED','FINISHED', etc.
      const isFinished = match.status === 'FINISHED'
      const golesLocal = match.score.fullTime.home
      const golesVisitante = match.score.fullTime.away

      // Skip if nothing changed
      const alreadyUpdated =
        partido.jugado === isFinished &&
        partido.goles_local_real === golesLocal &&
        partido.goles_visitante_real === golesVisitante &&
        partido.status === newStatus

      if (alreadyUpdated) { sinCambios++; continue }

      const updates: Record<string, unknown> = { status: newStatus }
      if (isFinished && golesLocal !== null && golesVisitante !== null) {
        updates.jugado = true
        updates.goles_local_real = golesLocal
        updates.goles_visitante_real = golesVisitante
      } else if (!isFinished) {
        // Keep jugado=true if already confirmed, only update status
        if (!partido.jugado) updates.jugado = false
      }

      const { error: updateErr } = await supabaseAdmin
        .from('partidos')
        .update(updates)
        .eq('id', partido.id)

      if (updateErr) {
        errores.push(`Error actualizando id=${partido.id}: ${updateErr.message}`)
      } else if (isFinished) {
        actualizados.push({
          id: partido.id,
          partido: `${partido.equipo_local} vs ${partido.equipo_visitante}`,
          resultado: `${golesLocal}-${golesVisitante}`,
        })
      }
    }

    // 5. Save sync timestamp to configuracion
    const timestamp = new Date().toISOString()
    const resumen = JSON.stringify({ actualizados, errores: errores.slice(0, 5), sinCambios })

    await supabaseAdmin.from('configuracion').upsert([
      { clave: 'ultima_sincronizacion', valor: timestamp, descripcion: 'Última sync automática de resultados' },
      { clave: 'ultima_sync_resumen', valor: resumen, descripcion: 'Resumen de la última sincronización' },
    ], { onConflict: 'clave' })

    return NextResponse.json({
      ok: true,
      timestamp,
      actualizados,
      sinCambios,
      errores,
      totalPartidosAPI: matches.length,
      finalizadosAPI: matches.filter(m => m.status === 'FINISHED').length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `Error inesperado: ${msg}` }, { status: 500 })
  }
}
