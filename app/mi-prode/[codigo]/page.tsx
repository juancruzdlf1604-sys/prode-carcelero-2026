import { supabaseServer as supabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import { BANDERAS } from '@/lib/types'
import { calcularPuntosGrupo, calcularPuntosBonus } from '@/lib/puntos'
import Link from 'next/link'

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
      .select('goles_local, goles_visitante, partidos(id, equipo_local, equipo_visitante, goles_local_real, goles_visitante_real, jugado, grupo, ronda, fecha)')
      .eq('participante_id', participante.id),
    supabase
      .from('pronosticos_eliminatorias')
      .select('ronda, equipo_local, equipo_visitante, goles_local, goles_visitante')
      .eq('participante_id', participante.id),
    supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
  ])

  // Calcular puntos de grupos y organizar por grupo
  let puntosGrupos = 0
  let exactosGrupos = 0

  interface DetallePartido {
    partido: {
      id: number; equipo_local: string; equipo_visitante: string
      goles_local_real: number | null; goles_visitante_real: number | null
      jugado: boolean; grupo: string | null; ronda: number | null; fecha: string | null
    }
    pron: { goles_local: number; goles_visitante: number }
    puntos: number | null
  }

  const grupoMap = new Map<string, DetallePartido[]>()

  // Supabase puede devolver la join como objeto o array según la versión del cliente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pronosticosGruposRaw?.forEach((pg: any) => {
    const partido: DetallePartido['partido'] | null = Array.isArray(pg.partidos)
      ? (pg.partidos[0] ?? null)
      : pg.partidos
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
    arr.push({ partido, pron: { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante }, puntos })
    grupoMap.set(grupo, arr)
  })

  // Ordenar partidos dentro de cada grupo por ronda
  Array.from(grupoMap.values()).forEach(partidos => {
    partidos.sort((a, b) => (a.partido.ronda ?? 0) - (b.partido.ronda ?? 0))
  })
  const grupos = Array.from(grupoMap.keys()).sort()

  // Organizar eliminatorias por ronda
  const rondasMap = new Map<string, typeof pronosticosElim>()
  pronosticosElim?.forEach(pe => {
    const arr = rondasMap.get(pe.ronda) || []
    arr.push(pe)
    rondasMap.set(pe.ronda, arr)
  })

  const puntosBonus = bonus && resultBonus ? calcularPuntosBonus(bonus, resultBonus) : 0
  const totalPuntos = puntosGrupos + puntosBonus
  const hayEliminatorias = RONDAS_ORDEN.some(r => (rondasMap.get(r)?.length ?? 0) > 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

        {/* Header del prode */}
        <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
          <div className="bg-gradient-to-r from-naval to-azul/30 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-dorado text-xs font-bold tracking-wider uppercase mb-1">Prode Carcelero 2026</p>
                <h1 className="text-2xl font-black text-white">{participante.nombre} {participante.apellido}</h1>
                <span className="inline-block mt-1.5 bg-oscuro/50 text-dorado font-black text-sm px-3 py-0.5 rounded-lg border border-dorado/30">
                  {participante.codigo}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-dorado text-4xl font-black leading-none">{totalPuntos}</div>
                <div className="text-white/50 text-xs mt-1">puntos</div>
              </div>
            </div>
          </div>

          {/* Breakdown de puntos */}
          <div className="grid grid-cols-3 divide-x divide-azul/20 border-t border-azul/20">
            <div className="px-4 py-3 text-center">
              <div className="text-lg font-black text-white">{puntosGrupos}</div>
              <div className="text-white/40 text-xs">Grupos</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-lg font-black text-white">{puntosBonus}</div>
              <div className="text-white/40 text-xs">Bonus</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-lg font-black text-white">{exactosGrupos}</div>
              <div className="text-white/40 text-xs">Exactos</div>
            </div>
          </div>
        </div>

        {/* Bonus */}
        {bonus && (
          <div className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-azul/20 flex items-center justify-between">
              <h2 className="text-dorado font-bold text-sm uppercase tracking-wider">🎯 Bonus iniciales</h2>
              {puntosBonus > 0 && (
                <span className="text-green-400 text-xs font-bold">+{puntosBonus} pts</span>
              )}
            </div>
            <div className="divide-y divide-azul/10">
              <BonusRow emoji="🏆" label="Campeón" value={bonus.campeon} real={resultBonus?.campeon} pts={50} />
              <BonusRow emoji="🥈" label="Subcampeón" value={bonus.subcampeon} real={resultBonus?.subcampeon} pts={25} />
              <BonusRow emoji="⚽" label="Goleador" value={bonus.goleador} real={resultBonus?.goleador} pts={20} />
              <BonusRow emoji="🧤" label="Guante de Oro" value={bonus.guante_oro} real={resultBonus?.guante_oro} pts={15} />
              <BonusRow emoji="⭐" label="Mejor Joven" value={bonus.mejor_joven} real={resultBonus?.mejor_joven} pts={15} />
            </div>
          </div>
        )}

        {/* Fase de grupos */}
        {grupos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-dorado font-bold text-sm uppercase tracking-wider px-1">⚽ Fase de grupos</h2>
            {grupos.map(grupo => (
              <div key={grupo} className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
                <div className="bg-azul/10 px-4 py-2.5 border-b border-azul/20">
                  <h3 className="text-white font-bold text-sm">Grupo {grupo}</h3>
                </div>
                <div className="divide-y divide-azul/10">
                  {grupoMap.get(grupo)!.map((d, i) => (
                    <div key={i} className="px-4 py-3">
                      {/* Pronóstico */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/50 text-xs flex-shrink-0">F{d.partido.ronda}</span>
                        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                          <span className="truncate text-white/80 text-xs">{BANDERAS[d.partido.equipo_local] || '🏳️'} {d.partido.equipo_local}</span>
                          <span className="font-black text-white flex-shrink-0 text-sm">
                            {d.pron.goles_local} - {d.pron.goles_visitante}
                          </span>
                          <span className="truncate text-white/80 text-xs text-right">{d.partido.equipo_visitante} {BANDERAS[d.partido.equipo_visitante] || '🏳️'}</span>
                        </div>
                        {/* Badge de puntos o estado */}
                        {d.puntos !== null ? (
                          <PuntajeBadge puntos={d.puntos} />
                        ) : (
                          <span className="text-white/25 text-xs flex-shrink-0">
                            {d.partido.fecha ? d.partido.fecha.slice(5).replace('-', '/') : '—'}
                          </span>
                        )}
                      </div>
                      {/* Resultado real si se jugó */}
                      {d.partido.jugado && (
                        <div className="mt-1.5 ml-6 text-xs text-white/35">
                          Real: {d.partido.goles_local_real} - {d.partido.goles_visitante_real}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Eliminatorias */}
        {hayEliminatorias && (
          <div className="space-y-3">
            <h2 className="text-dorado font-bold text-sm uppercase tracking-wider px-1">🏆 Eliminatorias</h2>
            {RONDAS_ORDEN.map(ronda => {
              const partidos = rondasMap.get(ronda)
              if (!partidos?.length) return null
              return (
                <div key={ronda} className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
                  <div className="bg-azul/10 px-4 py-2.5 border-b border-azul/20">
                    <h3 className="text-white font-bold text-sm">{RONDAS_LABELS[ronda]}</h3>
                  </div>
                  <div className="divide-y divide-azul/10">
                    {partidos.map((pe, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-2 text-sm">
                        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                          <span className="truncate text-white/80 text-xs">{BANDERAS[pe.equipo_local] || '🏳️'} {pe.equipo_local}</span>
                          <span className="font-black text-white flex-shrink-0">
                            {pe.goles_local ?? '?'} - {pe.goles_visitante ?? '?'}
                          </span>
                          <span className="truncate text-white/80 text-xs text-right">{pe.equipo_visitante} {BANDERAS[pe.equipo_visitante] || '🏳️'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Link a tabla */}
        <div className="text-center py-2">
          <Link href="/tabla" className="text-dorado text-sm underline underline-offset-2">
            Ver tabla de posiciones →
          </Link>
        </div>
      </div>
    </div>
  )
}

function BonusRow({
  emoji, label, value, real, pts,
}: {
  emoji: string; label: string; value: string; real?: string | null; pts: number
}) {
  const correcto = real && value.trim().toLowerCase() === real.trim().toLowerCase()
  const incorrecto = real && !correcto
  return (
    <div className="px-4 py-3 flex justify-between items-center gap-3">
      <span className="text-white/50 text-sm">{emoji} {label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className={`font-semibold text-sm ${correcto ? 'text-green-400' : incorrecto ? 'text-red-400' : 'text-white'}`}>
          {value || '—'}
        </span>
        {correcto && <span className="text-green-400 text-xs font-bold">+{pts}</span>}
        {incorrecto && <span className="text-white/30 text-xs">({real})</span>}
      </div>
    </div>
  )
}

function PuntajeBadge({ puntos }: { puntos: number }) {
  const color = puntos === 10
    ? 'bg-green-900/50 text-green-400 border-green-700/50'
    : puntos === 5
    ? 'bg-blue-900/50 text-blue-300 border-blue-700/50'
    : 'bg-red-900/20 text-red-400/70 border-red-700/20'
  return (
    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg border ${color}`}>
      {puntos > 0 ? `+${puntos}` : '0'}
    </span>
  )
}
