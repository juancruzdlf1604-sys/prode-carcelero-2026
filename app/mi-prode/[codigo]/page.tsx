import { supabaseAdmin as supabase } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import { calcularPuntosGrupo, calcularPuntosBonus } from '@/lib/puntos'
import MiProdeCliente, {
  type GrupoItem,
  type PartidoGrupoItem,
  type RondaItem,
} from './MiProdeCliente'

export const dynamic = 'force-dynamic'

interface Props {
  params: { codigo: string }
}

const RONDAS_ORDEN = ['dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final']
const RONDAS_LABELS: Record<string, string> = {
  dieciseisavos: 'Dieciseisavos de final',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinales',
  final: 'Final',
}

export default async function MiProdePage({ params }: Props) {
  const codigo = params.codigo.toUpperCase()

  const { data: participante } = await supabase
    .from('participantes')
    .select('id, codigo, nombre, apellido, eliminado')
    .eq('codigo', codigo)
    .single()

  if (!participante || participante.eliminado) notFound()

  const [
    { data: bonus },
    { data: pronosticosGruposRaw },
    { data: pronosticosElim },
    { data: resultBonus },
    { data: puntosPartidosRows },
  ] = await Promise.all([
    supabase.from('bonus').select('*').eq('participante_id', participante.id).single(),
    supabase
      .from('pronosticos_grupos')
      .select('partido_id, goles_local, goles_visitante')
      .eq('participante_id', participante.id),
    supabase
      .from('pronosticos_eliminatorias')
      .select('*')
      .eq('participante_id', participante.id),
    supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
    supabase
      .from('puntos_partidos')
      .select('partido_id, puntos')
      .eq('participante_id', participante.id),
  ])

  console.log('[mi-prode] participante.id:', participante.id, 'puntosPartidosRows:', JSON.stringify(puntosPartidosRows?.slice(0, 3)), 'pronosticosGrupos.length:', pronosticosGruposRaw?.length)

  // Fetch partido details — use Number() on all IDs to avoid string/number Map key mismatch
  const partidosMap = new Map<number, {
    id: number; equipo_local: string; equipo_visitante: string
    goles_local_real: number | null; goles_visitante_real: number | null
    jugado: boolean; grupo: string | null; ronda: number | null; fecha: string | null
  }>()

  if (pronosticosGruposRaw?.length) {
    const ids = pronosticosGruposRaw.map(pg => Number(pg.partido_id))
    const { data: partidos } = await supabase
      .from('partidos')
      .select('id, equipo_local, equipo_visitante, goles_local_real, goles_visitante_real, jugado, grupo, ronda, fecha')
      .in('id', ids)
    partidos?.forEach(p => partidosMap.set(Number(p.id), p))
  }

  // Totals come directly from puntos_partidos (pre-calculated by admin when saving results)
  const puntosPartidosMap = new Map<number, number>()
  puntosPartidosRows?.forEach(pp => puntosPartidosMap.set(Number(pp.partido_id), Number(pp.puntos)))

  const puntosGrupos = puntosPartidosRows?.reduce((sum, pp) => sum + Number(pp.puntos), 0) ?? 0
  const exactosGrupos = puntosPartidosRows?.filter(pp => Number(pp.puntos) === 10).length ?? 0

  console.log('[mi-prode] puntosGrupos from puntos_partidos:', puntosGrupos, 'rows:', puntosPartidosRows?.length ?? 0)

  // Build group display data
  const grupoMap = new Map<string, PartidoGrupoItem[]>()

  pronosticosGruposRaw?.forEach(pg => {
    const pgIdNum = Number(pg.partido_id)
    const partido = partidosMap.get(pgIdNum)
    if (!partido) return

    // Look up pre-calculated puntos for this match (null if not yet played)
    const puntos = puntosPartidosMap.has(pgIdNum)
      ? puntosPartidosMap.get(pgIdNum)!
      : (partido.jugado && partido.goles_local_real !== null && partido.goles_visitante_real !== null)
        ? calcularPuntosGrupo(
            { goles_local: Number(pg.goles_local), goles_visitante: Number(pg.goles_visitante) },
            { goles_local_real: Number(partido.goles_local_real), goles_visitante_real: Number(partido.goles_visitante_real) }
          )
        : null

    const grupo = partido.grupo || 'N/A'
    const arr = grupoMap.get(grupo) || []
    arr.push({
      ronda: partido.ronda,
      equipo_local: partido.equipo_local,
      equipo_visitante: partido.equipo_visitante,
      goles_local: Number(pg.goles_local),
      goles_visitante: Number(pg.goles_visitante),
      jugado: partido.jugado,
      goles_local_real: partido.goles_local_real,
      goles_visitante_real: partido.goles_visitante_real,
      fecha: partido.fecha,
      puntos,
    })
    grupoMap.set(grupo, arr)
  })

  // Sort each group by ronda
  Array.from(grupoMap.values()).forEach(partidos => {
    partidos.sort((a, b) => (a.ronda ?? 0) - (b.ronda ?? 0))
  })

  const grupos: GrupoItem[] = Array.from(grupoMap.keys()).sort().map(grupo => ({
    grupo,
    partidos: grupoMap.get(grupo)!,
  }))

  // Build eliminatorias data
  const rondasMap = new Map<string, typeof pronosticosElim>()
  pronosticosElim?.forEach(pe => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key: string = (pe as any).ronda ?? (pe as any).fase ?? ''
    const arr = rondasMap.get(key) || []
    arr.push(pe)
    rondasMap.set(key, arr)
  })

  const rondas: RondaItem[] = RONDAS_ORDEN
    .filter(r => (rondasMap.get(r)?.length ?? 0) > 0)
    .map(r => ({
      ronda: r,
      label: RONDAS_LABELS[r],
      partidos: (rondasMap.get(r) ?? []).map(pe => ({
        equipo_local: pe.equipo_local,
        equipo_visitante: pe.equipo_visitante,
        goles_local: pe.goles_local,
        goles_visitante: pe.goles_visitante,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ganador_penales: (pe as any).ganador_penales ?? null,
      })),
    }))

  const puntosBonus = bonus && resultBonus ? calcularPuntosBonus(bonus, resultBonus) : 0
  const totalPuntos = puntosGrupos + puntosBonus

  console.log('[mi-prode] FINAL total:', totalPuntos, 'grupos:', puntosGrupos, 'bonus:', puntosBonus, 'partidosMap:', partidosMap.size)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MiProdeCliente
        participante={{ nombre: participante.nombre, apellido: participante.apellido, codigo: participante.codigo }}
        puntosPartidos={puntosPartidosRows ?? []}
        puntosBonus={puntosBonus}
        exactosGrupos={exactosGrupos}
        grupos={grupos}
        rondas={rondas}
        bonus={bonus}
        resultBonus={resultBonus}
      />
    </div>
  )
}
