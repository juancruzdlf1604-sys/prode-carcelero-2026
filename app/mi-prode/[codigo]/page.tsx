import { supabaseServer as supabase } from '@/lib/supabase/server'
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
    .select('id, codigo, nombre, apellido')
    .eq('codigo', codigo)
    .single()

  if (!participante) notFound()

  const [
    { data: bonus },
    { data: pronosticosGruposRaw },
    { data: pronosticosElim },
    { data: resultBonus },
  ] = await Promise.all([
    supabase.from('bonus').select('*').eq('participante_id', participante.id).single(),
    supabase
      .from('pronosticos_grupos')
      .select('partido_id, goles_local, goles_visitante')
      .eq('participante_id', participante.id),
    supabase
      .from('pronosticos_eliminatorias')
      .select('ronda, equipo_local, equipo_visitante, goles_local, goles_visitante')
      .eq('participante_id', participante.id),
    supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
  ])

  // Fetch partido details for the group pronosticos
  const partidosMap = new Map<number, {
    id: number; equipo_local: string; equipo_visitante: string
    goles_local_real: number | null; goles_visitante_real: number | null
    jugado: boolean; grupo: string | null; ronda: number | null; fecha: string | null
  }>()

  if (pronosticosGruposRaw?.length) {
    const ids = pronosticosGruposRaw.map(pg => pg.partido_id)
    const { data: partidos } = await supabase
      .from('partidos')
      .select('id, equipo_local, equipo_visitante, goles_local_real, goles_visitante_real, jugado, grupo, ronda, fecha')
      .in('id', ids)
    partidos?.forEach(p => partidosMap.set(p.id, p))
  }

  // Build group data
  let puntosGrupos = 0
  let exactosGrupos = 0
  const grupoMap = new Map<string, PartidoGrupoItem[]>()

  pronosticosGruposRaw?.forEach(pg => {
    const partido = partidosMap.get(pg.partido_id)
    if (!partido) return

    let puntos: number | null = null
    if (partido.jugado && partido.goles_local_real !== null && partido.goles_visitante_real !== null) {
      puntos = calcularPuntosGrupo(
        { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante },
        { goles_local_real: partido.goles_local_real, goles_visitante_real: partido.goles_visitante_real }
      )
      puntosGrupos += puntos
      if (puntos === 10) exactosGrupos++
    }

    const grupo = partido.grupo || 'N/A'
    const arr = grupoMap.get(grupo) || []
    arr.push({
      ronda: partido.ronda,
      equipo_local: partido.equipo_local,
      equipo_visitante: partido.equipo_visitante,
      goles_local: pg.goles_local,
      goles_visitante: pg.goles_visitante,
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
    const arr = rondasMap.get(pe.ronda) || []
    arr.push(pe)
    rondasMap.set(pe.ronda, arr)
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
      })),
    }))

  const puntosBonus = bonus && resultBonus ? calcularPuntosBonus(bonus, resultBonus) : 0
  const totalPuntos = puntosGrupos + puntosBonus

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MiProdeCliente
        participante={{ nombre: participante.nombre, apellido: participante.apellido, codigo: participante.codigo }}
        totalPuntos={totalPuntos}
        puntosGrupos={puntosGrupos}
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
