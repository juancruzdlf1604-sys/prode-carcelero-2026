'use client'

import { useState } from 'react'
import type { DatosProde } from '../FormularioProde'
import { SELECCIONES_MUNDIAL, BANDERAS } from '@/lib/types'

interface Props {
  datos: DatosProde
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
  onAnterior: () => void
}

const FASES = [
  { key: 'dieciseisavos', label: 'Dieciseisavos', slots: 16, emoji: '32' },
  { key: 'octavos', label: 'Octavos de Final', slots: 8, emoji: '16' },
  { key: 'cuartos', label: 'Cuartos de Final', slots: 4, emoji: '8' },
  { key: 'semifinal', label: 'Semifinales', slots: 2, emoji: '4' },
  { key: 'final', label: 'Final', slots: 1, emoji: '🏆' },
] as const

export default function PasoEliminatorias({ datos, onChange, onSiguiente, onAnterior }: Props) {
  const [faseActual, setFaseActual] = useState(0)

  const fase = FASES[faseActual]

  const updateElim = (slot: number, field: string, value: string | number) => {
    const key = `${fase.key}_${slot}`
    const prev = datos.eliminatorias[key] || { fase: fase.key, slot, equipo_local: '', equipo_visitante: '', goles_local: 0, goles_visitante: 0 }
    onChange({
      eliminatorias: {
        ...datos.eliminatorias,
        [key]: { ...prev, [field]: value },
      },
    })
  }

  const getElim = (slot: number) => {
    return datos.eliminatorias[`${fase.key}_${slot}`] || {
      fase: fase.key, slot,
      equipo_local: '', equipo_visitante: '',
      goles_local: 0, goles_visitante: 0,
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">🏆 Fase Eliminatoria</h2>
        <p className="text-white/50 text-sm">Elegí los equipos y el resultado de cada cruce</p>
      </div>

      {/* Tabs de fases */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FASES.map((f, i) => (
          <button
            key={f.key}
            onClick={() => setFaseActual(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              faseActual === i ? 'bg-dorado text-oscuro' : 'bg-naval border border-azul/30 text-white/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Partidos de la fase */}
      <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
        <div className="bg-azul/20 px-4 py-2.5 border-b border-azul/30">
          <h3 className="font-black text-white">{fase.label}</h3>
          <p className="text-white/40 text-xs">{fase.slots} {fase.slots === 1 ? 'partido' : 'partidos'}</p>
        </div>
        <div className="divide-y divide-azul/20">
          {Array.from({ length: fase.slots }, (_, i) => i + 1).map(slot => {
            const e = getElim(slot)
            return (
              <div key={slot} className="px-4 py-4">
                <p className="text-white/30 text-xs mb-2">Partido {slot}</p>

                {/* Selector de equipos */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Equipo local</label>
                    <select
                      value={e.equipo_local}
                      onChange={ev => updateElim(slot, 'equipo_local', ev.target.value)}
                      className="w-full bg-oscuro border border-azul/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-dorado appearance-none"
                    >
                      <option value="">— Seleccionar —</option>
                      {SELECCIONES_MUNDIAL.map(s => (
                        <option key={s} value={s}>{BANDERAS[s]} {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Equipo visitante</label>
                    <select
                      value={e.equipo_visitante}
                      onChange={ev => updateElim(slot, 'equipo_visitante', ev.target.value)}
                      className="w-full bg-oscuro border border-azul/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-dorado appearance-none"
                    >
                      <option value="">— Seleccionar —</option>
                      {SELECCIONES_MUNDIAL.map(s => (
                        <option key={s} value={s}>{BANDERAS[s]} {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Marcador (solo si eligió los equipos) */}
                {e.equipo_local && e.equipo_visitante && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-end gap-2">
                      <span className="text-xs text-white/70 truncate text-right">{BANDERAS[e.equipo_local]} {e.equipo_local}</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={e.goles_local}
                        onChange={ev => updateElim(slot, 'goles_local', Math.max(0, parseInt(ev.target.value) || 0))}
                        className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none"
                      />
                    </div>
                    <span className="text-dorado font-bold">–</span>
                    <div className="flex-1 flex items-center justify-start gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={e.goles_visitante}
                        onChange={ev => updateElim(slot, 'goles_visitante', Math.max(0, parseInt(ev.target.value) || 0))}
                        className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none"
                      />
                      <span className="text-xs text-white/70 truncate">{BANDERAS[e.equipo_visitante]} {e.equipo_visitante}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navegación entre fases */}
      <div className="flex gap-2">
        {faseActual > 0 && (
          <button
            onClick={() => setFaseActual(f => f - 1)}
            className="flex-1 border border-azul/50 text-white py-3 rounded-xl font-semibold hover:bg-azul/20 transition-colors text-sm"
          >
            ← {FASES[faseActual - 1].label}
          </button>
        )}
        {faseActual < FASES.length - 1 ? (
          <button
            onClick={() => setFaseActual(f => f + 1)}
            className="flex-1 bg-azul text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
          >
            {FASES[faseActual + 1].label} →
          </button>
        ) : (
          <button
            onClick={onSiguiente}
            className="flex-1 bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors active:scale-95"
          >
            Revisar y enviar →
          </button>
        )}
      </div>

      <button onClick={onAnterior} className="w-full border border-azul/30 text-white/50 font-semibold py-2 rounded-xl hover:bg-azul/10 transition-colors text-sm">
        ← Volver a grupos
      </button>
    </div>
  )
}
