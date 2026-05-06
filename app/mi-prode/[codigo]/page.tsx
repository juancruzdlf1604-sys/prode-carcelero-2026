import { supabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import { BANDERAS } from '@/lib/types'
import { calcularPuntosGrupo, calcularPuntosBonus } from '@/lib/puntos'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
interface Props {
  params: { codigo: string }
}

export default async function MiProdePage({ params }: Props) {
  const codigo = params.codigo.toUpperCase()

  const { data: participante } = await supabase
    .from('participantes')
    .select('*')
    .eq('codigo', codigo)
    .single()

  if (!participante) notFound()

  const [{ data: bonus }, { data: pronosticosGrupos }, , , { data: resultBonus }, { data: config }] =
    await Promise.all([
      supabase.from('bonus').select('*').eq('participante_id', participante.id).single(),
      supabase.from('pronosticos_grupos').select('*, partidos(*)').eq('participante_id', participante.id),
      supabase.from('pronosticos_eliminatorias').select('*').eq('participante_id', participante.id),
      supabase.from('partidos').select('*').eq('fase', 'grupos').order('grupo').order('ronda'),
      supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
      supabase.from('configuracion').select('clave, valor'),
    ])

  const configMap: Record<string, string> = {}
  config?.forEach(c => { configMap[c.clave] = c.valor })

  // Calcular puntos
  let puntosGrupos = 0
  let exactosGrupos = 0
  const detalleGrupos: Array<{ partido: { equipo_local: string; equipo_visitante: string; goles_local_real?: number; goles_visitante_real?: number; jugado: boolean; grupo?: string }; pron: { goles_local: number; goles_visitante: number }; puntos: number }> = []

  pronosticosGrupos?.forEach((pg: { goles_local: number; goles_visitante: number; partidos: { equipo_local: string; equipo_visitante: string; goles_local_real?: number; goles_visitante_real?: number; jugado: boolean; grupo?: string } | null }) => {
    const partido = pg.partidos
    if (!partido || !partido.jugado) return
    const pts = calcularPuntosGrupo(
      { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante },
      { goles_local_real: partido.goles_local_real!, goles_visitante_real: partido.goles_visitante_real! }
    )
    puntosGrupos += pts
    if (pts === 10) exactosGrupos++
    detalleGrupos.push({ partido, pron: { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante }, puntos: pts })
  })

  const puntosBonus = bonus && resultBonus ? calcularPuntosBonus(bonus, resultBonus) : 0
  const totalPuntos = puntosGrupos + puntosBonus

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Header del prode */}
        <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
          <div className="bg-gradient-to-r from-naval to-azul/30 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-dorado text-xs font-bold tracking-wider uppercase mb-1">Tu prode</p>
                <h1 className="text-2xl font-black text-white">{participante.nombre} {participante.apellido}</h1>
                <p className="text-white/50 text-sm mt-0.5">{participante.whatsapp}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-dorado text-3xl font-black">{totalPuntos}</div>
                <div className="text-white/50 text-xs">puntos</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="bg-oscuro/50 text-dorado font-black text-sm px-3 py-1 rounded-lg border border-dorado/30">
                {participante.codigo}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                participante.pago_confirmado
                  ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'
              }`}>
                {participante.pago_confirmado ? '✓ Pago confirmado' : '⏳ Pago pendiente'}
              </span>
            </div>
          </div>
        </div>

        {/* Instrucciones de pago si está pendiente */}
        {!participante.pago_confirmado && (
          <div className="bg-azul/10 border border-azul/30 rounded-xl p-4 text-sm space-y-2">
            <p className="font-semibold text-dorado">💳 Para completar tu inscripción:</p>
            <p className="text-white/70">
              Transferí <strong className="text-white">${parseInt(configMap.precio_inscripcion || '5000').toLocaleString('es-AR')}</strong> al alias{' '}
              <strong className="text-dorado font-mono">{configMap.alias_pago || 'ALIAS.CLUB.SANCARLOS'}</strong>
            </p>
            <p className="text-white/50">
              Mandá el comprobante por WhatsApp a{' '}
              <a href={`https://wa.me/${configMap.whatsapp_admin}`} className="text-dorado underline">
                +{configMap.whatsapp_admin}
              </a>
            </p>
            <p className="text-white/40 text-xs">Indicá tu código: <strong>{participante.codigo}</strong></p>
          </div>
        )}

        {/* Puntos breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-naval rounded-xl p-3 border border-azul/20">
            <div className="text-xl font-black text-dorado">{puntosGrupos}</div>
            <div className="text-white/50 text-xs">Grupos</div>
          </div>
          <div className="bg-naval rounded-xl p-3 border border-azul/20">
            <div className="text-xl font-black text-dorado">{puntosBonus}</div>
            <div className="text-white/50 text-xs">Bonus</div>
          </div>
          <div className="bg-naval rounded-xl p-3 border border-azul/20">
            <div className="text-xl font-black text-dorado">{exactosGrupos}</div>
            <div className="text-white/50 text-xs">Exactos</div>
          </div>
        </div>

        {/* Bonus */}
        {bonus && (
          <div className="bg-naval rounded-xl border border-azul/30 p-4">
            <h2 className="text-dorado font-bold text-sm uppercase tracking-wider mb-3">🎯 Tus Bonus</h2>
            <div className="space-y-2 text-sm">
              <BonusRow emoji="🏆" label="Campeón" value={bonus.campeon} real={resultBonus?.campeon} />
              <BonusRow emoji="🥈" label="Subcampeón" value={bonus.subcampeon} real={resultBonus?.subcampeon} />
              <BonusRow emoji="⚽" label="Goleador" value={bonus.goleador} real={resultBonus?.goleador} />
              <BonusRow emoji="🧤" label="Guante de Oro" value={bonus.guante_oro} real={resultBonus?.guante_oro} />
              <BonusRow emoji="⭐" label="Mejor Joven" value={bonus.mejor_joven} real={resultBonus?.mejor_joven} />
            </div>
          </div>
        )}

        {/* Resultados de grupos jugados */}
        {detalleGrupos.length > 0 && (
          <div className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-azul/20">
              <h2 className="text-dorado font-bold text-sm uppercase tracking-wider">⚽ Grupos — Partidos jugados</h2>
            </div>
            <div className="divide-y divide-azul/10">
              {detalleGrupos.map((d, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm flex-1 min-w-0">
                    <p className="text-white/40 text-xs mb-0.5">Grupo {d.partido.grupo}</p>
                    <p className="font-semibold text-white truncate">
                      {BANDERAS[d.partido.equipo_local]} {d.partido.equipo_local} {d.pron.goles_local}-{d.pron.goles_visitante} {d.partido.equipo_visitante} {BANDERAS[d.partido.equipo_visitante]}
                    </p>
                    <p className="text-white/40 text-xs">
                      Real: {d.partido.goles_local_real}-{d.partido.goles_visitante_real}
                    </p>
                  </div>
                  <PuntajeBadge puntos={d.puntos} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ver tabla */}
        <div className="text-center py-2">
          <Link href="/tabla" className="text-dorado text-sm underline underline-offset-2">
            Ver tabla de posiciones →
          </Link>
        </div>
      </div>
    </div>
  )
}

function BonusRow({ emoji, label, value, real }: { emoji: string; label: string; value: string; real?: string | null }) {
  const correcto = real && value === real
  const incorrecto = real && value !== real
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/50">{emoji} {label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${correcto ? 'text-green-400' : incorrecto ? 'text-red-400' : 'text-white'}`}>
          {value}
        </span>
        {correcto && <span className="text-green-400 text-xs">✓</span>}
        {incorrecto && <span className="text-white/30 text-xs">({real})</span>}
      </div>
    </div>
  )
}

function PuntajeBadge({ puntos }: { puntos: number }) {
  const color = puntos === 10 ? 'bg-green-900/50 text-green-400 border-green-700/50'
    : puntos === 5 ? 'bg-blue-900/50 text-blue-300 border-blue-700/50'
    : 'bg-red-900/20 text-red-400/70 border-red-700/20'
  return (
    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border ${color}`}>
      {puntos > 0 ? `+${puntos}` : '0'}
    </span>
  )
}
