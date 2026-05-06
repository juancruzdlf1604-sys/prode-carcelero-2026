'use client'

import { useMemo, useState } from 'react'
import type { DatosProde } from '../FormularioProde'
import { BANDERAS } from '@/lib/types'
import {
  BRACKETS,
  calcularClasificacion,
  getBest3rds,
  type SlotOrigen,
} from '@/lib/partidos-data'

interface Props {
  datos: DatosProde
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
  onAnterior: () => void
}

const FASES = [
  { key: 'dieciseisavos', label: 'Dieciseisavos', partidos: 16 },
  { key: 'octavos',       label: 'Octavos',        partidos: 8  },
  { key: 'cuartos',       label: 'Cuartos',         partidos: 4  },
  { key: 'semifinal',     label: 'Semifinales',     partidos: 2  },
  { key: 'final',         label: 'Final',           partidos: 1  },
] as const

type ElimEntry = {
  fase: string
  slot: number
  equipo_local: string
  equipo_visitante: string
  goles_local: number
  goles_visitante: number
  ganador?: string
}

function getWinner(e: ElimEntry | undefined): string {
  if (!e) return ''
  if (!e.equipo_local || !e.equipo_visitante) return ''
  if (e.goles_local > e.goles_visitante) return e.equipo_local
  if (e.goles_visitante > e.goles_local) return e.equipo_visitante
  return e.ganador || ''
}

function resolveTeam(
  origen: SlotOrigen,
  clasificaciones: Record<string, string[]>,
  best3rds: string[],
  eliminatorias: Record<string, ElimEntry>
): string {
  if (origen.tipo === 'grupo') {
    const clasif = clasificaciones[origen.grupo]
    return clasif?.[origen.pos - 1] ?? `${origen.pos}°${origen.grupo}`
  }
  if (origen.tipo === 'best3') {
    return best3rds[origen.pos - 1] ?? `M3°${origen.pos}`
  }
  // tipo === 'ganador'
  const key = `${origen.fase}_${origen.slot}`
  return getWinner(eliminatorias[key]) || ''
}

export default function PasoEliminatorias({ datos, onChange, onSiguiente, onAnterior }: Props) {
  const [faseIdx, setFaseIdx] = useState(0)
  const [guardado, setGuardado] = useState(false)

  const clasificaciones = useMemo(() => {
    const raw = calcularClasificacion(datos.pronosticos)
    const result: Record<string, string[]> = {}
    for (const [g, c] of Object.entries(raw)) {
      result[g] = c.map(x => x.equipo)
    }
    return result
  }, [datos.pronosticos])

  const best3rds = useMemo(() => {
    const raw = calcularClasificacion(datos.pronosticos)
    return getBest3rds(raw)
  }, [datos.pronosticos])

  const elim = datos.eliminatorias as Record<string, ElimEntry>

  // Always store resolved team names so getWinner can cascade to the next round
  const updateElim = (fase: string, slot: number, campo: string, valor: string | number, tlResolved?: string, tvResolved?: string) => {
    const key = `${fase}_${slot}`
    const prev = elim[key] ?? { fase, slot, equipo_local: '', equipo_visitante: '', goles_local: 0, goles_visitante: 0 }
    const updated: ElimEntry = { ...prev, [campo]: valor }

    if (tlResolved) updated.equipo_local = tlResolved
    if (tvResolved) updated.equipo_visitante = tvResolved

    if (campo === 'goles_local' || campo === 'goles_visitante') {
      const gl = campo === 'goles_local' ? (valor as number) : prev.goles_local
      const gv = campo === 'goles_visitante' ? (valor as number) : prev.goles_visitante
      if (gl !== gv) delete updated.ganador
    }

    onChange({ eliminatorias: { ...elim, [key]: updated } })
  }

  const guardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const fase = FASES[faseIdx]
  const bracket = BRACKETS[fase.key]

  const completadosFase = bracket.filter(b => {
    const key = `${fase.key}_${b.slot}`
    const e = elim[key]
    if (!e) return false
    const tl = resolveTeam(b.l, clasificaciones, best3rds, elim)
    const tv = resolveTeam(b.v, clasificaciones, best3rds, elim)
    if (!tl || !tv) return false
    return getWinner(e) !== ''
  }).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">🏆 Fase Eliminatoria</h2>
        <p className="text-white/50 text-sm">Los equipos se determinan desde tus pronósticos de grupos</p>
      </div>

      {/* Tabs de fases */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FASES.map((f, i) => {
          const br = BRACKETS[f.key]
          const comp = br.filter(b => {
            const key = `${f.key}_${b.slot}`
            return getWinner(elim[key]) !== ''
          }).length
          const allDone = comp === br.length
          return (
            <button
              key={f.key}
              onClick={() => setFaseIdx(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                faseIdx === i
                  ? 'bg-dorado text-oscuro'
                  : allDone
                  ? 'bg-azul/40 text-white border border-azul/50'
                  : 'bg-naval border border-azul/30 text-white/60'
              }`}
            >
              {allDone && faseIdx !== i ? '✓ ' : ''}{f.label}
            </button>
          )
        })}
      </div>

      {/* Partidos de la fase */}
      <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
        <div className="bg-azul/20 px-4 py-2.5 border-b border-azul/30 flex items-center justify-between">
          <h3 className="font-black text-white">{fase.label}</h3>
          <span className="text-white/40 text-xs">{completadosFase}/{fase.partidos} definidos</span>
        </div>

        <div className="divide-y divide-azul/20">
          {bracket.map(b => {
            const key = `${fase.key}_${b.slot}`
            const e = elim[key] ?? { fase: fase.key, slot: b.slot, equipo_local: '', equipo_visitante: '', goles_local: 0, goles_visitante: 0 }
            const tl = resolveTeam(b.l, clasificaciones, best3rds, elim)
            const tv = resolveTeam(b.v, clasificaciones, best3rds, elim)
            const gl = e.goles_local ?? 0
            const gv = e.goles_visitante ?? 0
            const empate = !!(tl && tv && gl === gv)
            const winner = getWinner({ ...e, equipo_local: tl || e.equipo_local, equipo_visitante: tv || e.equipo_visitante })

            return (
              <div key={b.slot} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/30 text-xs">Partido {b.slot}</span>
                  {winner && (
                    <span className="text-green-400 text-xs font-semibold">
                      Avanza: {BANDERAS[winner] || ''} {winner}
                    </span>
                  )}
                </div>

                {!tl || !tv ? (
                  <div className="text-center py-3">
                    <p className="text-white/30 text-sm">⏳ Por determinar</p>
                    <p className="text-white/20 text-xs mt-1">Completá las rondas anteriores para ver estos equipos</p>
                  </div>
                ) : (
                  <>
                    {/* Marcador */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                        <span className={`text-xs sm:text-sm font-semibold truncate text-right ${winner === tl ? 'text-dorado' : 'text-white/80'}`}>
                          {BANDERAS[tl] || '🏳️'} {tl}
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0} max={99}
                          value={gl}
                          onChange={ev => updateElim(fase.key, b.slot, 'goles_local', Math.max(0, parseInt(ev.target.value) || 0), tl, tv)}
                          onFocus={ev => ev.target.select()}
                          className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                        />
                      </div>
                      <div className="text-dorado font-bold text-lg flex-shrink-0">–</div>
                      <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0} max={99}
                          value={gv}
                          onChange={ev => updateElim(fase.key, b.slot, 'goles_visitante', Math.max(0, parseInt(ev.target.value) || 0), tl, tv)}
                          onFocus={ev => ev.target.select()}
                          className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                        />
                        <span className={`text-xs sm:text-sm font-semibold truncate ${winner === tv ? 'text-dorado' : 'text-white/80'}`}>
                          {BANDERAS[tv] || '🏳️'} {tv}
                        </span>
                      </div>
                    </div>

                    {/* Desempate por penales */}
                    {empate && !winner && (
                      <div className="mt-3 bg-oscuro/60 rounded-lg p-3 border border-dorado/20">
                        <p className="text-dorado text-xs font-semibold mb-2">⚡ Empate — ¿Quién avanza en penales?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateElim(fase.key, b.slot, 'ganador', tl, tl, tv)}
                            className="flex-1 py-2 text-xs font-bold rounded-lg bg-azul/40 text-white hover:bg-azul transition-colors"
                          >
                            {BANDERAS[tl] || ''} {tl}
                          </button>
                          <button
                            onClick={() => updateElim(fase.key, b.slot, 'ganador', tv, tl, tv)}
                            className="flex-1 py-2 text-xs font-bold rounded-lg bg-azul/40 text-white hover:bg-azul transition-colors"
                          >
                            {BANDERAS[tv] || ''} {tv}
                          </button>
                        </div>
                      </div>
                    )}
                    {empate && winner && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-white/40 text-xs">Avanza por penales: <span className="text-dorado">{winner}</span></p>
                        <button
                          onClick={() => updateElim(fase.key, b.slot, 'ganador', '', tl, tv)}
                          className="text-white/30 text-xs hover:text-white/60"
                        >
                          cambiar
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Guardar progreso */}
      <button
        onClick={guardar}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
          guardado
            ? 'bg-green-900/30 border-green-500/50 text-green-400'
            : 'border-azul/40 text-white/50 hover:bg-azul/10'
        }`}
      >
        {guardado ? '✓ Progreso guardado' : '💾 Guardar progreso'}
      </button>

      {/* Navegación entre fases */}
      <div className="flex gap-2">
        {faseIdx > 0 && (
          <button
            onClick={() => setFaseIdx(i => i - 1)}
            className="flex-1 border border-azul/50 text-white py-3 rounded-xl font-semibold hover:bg-azul/20 transition-colors text-sm"
          >
            ← {FASES[faseIdx - 1].label}
          </button>
        )}
        {faseIdx < FASES.length - 1 ? (
          <button
            onClick={() => setFaseIdx(i => i + 1)}
            className="flex-1 bg-azul text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
          >
            {FASES[faseIdx + 1].label} →
          </button>
        ) : (
          <button
            onClick={onSiguiente}
            className="flex-1 bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors active:scale-95"
          >
            Bonus y revisar →
          </button>
        )}
      </div>

      <button
        onClick={onAnterior}
        className="w-full border border-azul/30 text-white/50 font-semibold py-2 rounded-xl hover:bg-azul/10 transition-colors text-sm"
      >
        ← Volver a grupos
      </button>
    </div>
  )
}
