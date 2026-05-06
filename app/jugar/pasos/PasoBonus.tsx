'use client'

import { useState } from 'react'
import type { DatosProde } from '../FormularioProde'
import { SELECCIONES_MUNDIAL } from '@/lib/types'

interface Props {
  datos: DatosProde
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
  onAnterior: () => void
}

const BONUS_CONFIG: Array<{ key: string; label: string; emoji: string; puntos: number; esJugador?: boolean }> = [
  { key: 'campeon', label: 'Campeón del Mundial', emoji: '🏆', puntos: 100 },
  { key: 'subcampeon', label: 'Subcampeón', emoji: '🥈', puntos: 50 },
  { key: 'goleador', label: 'Goleador del torneo', emoji: '⚽', puntos: 50, esJugador: true },
  { key: 'guante_oro', label: 'Guante de Oro (mejor arquero)', emoji: '🧤', puntos: 50, esJugador: true },
  { key: 'mejor_joven', label: 'Mejor Jugador Joven', emoji: '⭐', puntos: 50, esJugador: true },
]

export default function PasoBonus({ datos, onChange, onSiguiente, onAnterior }: Props) {
  const [errores, setErrores] = useState<Record<string, string>>({})

  const validar = () => {
    const e: Record<string, string> = {}
    BONUS_CONFIG.forEach(b => {
      const val = (datos.bonus as Record<string, string>)[b.key]
      if (!val?.trim()) e[b.key] = 'Campo requerido'
    })
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const updateBonus = (key: string, value: string) => {
    onChange({ bonus: { ...datos.bonus, [key]: value } })
    if (errores[key]) setErrores(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="space-y-4">
      <div className="bg-naval rounded-2xl p-6 border border-azul/30">
        <h2 className="text-xl font-black text-white mb-1">🎯 Bonus Iniciales</h2>
        <p className="text-white/50 text-sm mb-1">No se pueden modificar una vez enviado el prode</p>
        <div className="bg-dorado/10 border border-dorado/30 rounded-lg px-3 py-2 text-dorado text-xs font-semibold mb-6">
          ⚠️ Elegí con cuidado — estos dan los puntos más altos
        </div>

        <div className="space-y-4">
          {BONUS_CONFIG.map(b => (
            <div key={b.key}>
              <label className="text-sm font-semibold text-white/70 mb-1.5 flex items-center gap-2">
                <span>{b.emoji}</span>
                <span>{b.label}</span>
                <span className="ml-auto text-dorado font-bold">{b.puntos} pts</span>
              </label>
              {b.esJugador ? (
                <>
                  <input
                    type="text"
                    value={(datos.bonus as Record<string, string>)[b.key] || ''}
                    onChange={e => updateBonus(b.key, e.target.value)}
                    placeholder="Apellido del jugador"
                    className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado transition-colors placeholder:text-white/30"
                  />
                  <p className="text-white/30 text-xs mt-1">Escribir solo el apellido. Ej: Messi</p>
                </>
              ) : (
                <select
                  value={(datos.bonus as Record<string, string>)[b.key] || ''}
                  onChange={e => updateBonus(b.key, e.target.value)}
                  className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado transition-colors appearance-none"
                >
                  <option value="">— Elegí una selección —</option>
                  {SELECCIONES_MUNDIAL.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              {errores[b.key] && <p className="text-red-400 text-xs mt-1">{errores[b.key]}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onAnterior} className="flex-1 border-2 border-azul text-white font-bold py-3 rounded-xl hover:bg-azul/20 transition-colors">
          ← Atrás
        </button>
        <button onClick={() => { if (validar()) onSiguiente() }} className="flex-[2] bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors active:scale-95">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
