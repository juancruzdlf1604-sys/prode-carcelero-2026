'use client'

import { useState, useMemo } from 'react'
import type { DatosProde } from '../FormularioProde'
import type { Partido } from '@/lib/types'
import { BANDERAS } from '@/lib/types'
import { formatearFecha } from '@/lib/utils'

interface Props {
  datos: DatosProde
  partidos: Partido[]
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
  onAnterior: () => void
}

export default function PasoGrupos({ datos, partidos, onChange, onSiguiente, onAnterior }: Props) {
  const [grupoActual, setGrupoActual] = useState('A')
  const [error, setError] = useState('')

  const grupos = useMemo(() => {
    const seen = new Map<string, boolean>()
    const gs: string[] = []
    partidos.forEach(p => { if (p.grupo && !seen.has(p.grupo)) { seen.set(p.grupo, true); gs.push(p.grupo) } })
    return gs.sort()
  }, [partidos])

  const partidosGrupo = useMemo(() =>
    partidos.filter(p => p.grupo === grupoActual),
    [partidos, grupoActual]
  )

  const completados = useMemo(() =>
    partidos.filter(p => datos.pronosticos[p.id] !== undefined).length,
    [partidos, datos.pronosticos]
  )

  const updatePronostico = (partidoId: number, local: number, visitante: number) => {
    onChange({
      pronosticos: {
        ...datos.pronosticos,
        [partidoId]: { goles_local: local, goles_visitante: visitante },
      },
    })
    setError('')
  }

  const handleSiguiente = () => {
    if (completados < partidos.length) {
      setError(`Completá todos los partidos. Faltan ${partidos.length - completados}.`)
      return
    }
    onSiguiente()
  }

  const grupoIdx = grupos.indexOf(grupoActual)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">⚽ Fase de Grupos</h2>
          <p className="text-white/50 text-xs">{completados}/{partidos.length} partidos completados</p>
        </div>
        {/* Barra de progreso */}
        <div className="text-right">
          <div className="text-dorado font-bold text-sm">{Math.round(completados / Math.max(partidos.length, 1) * 100)}%</div>
          <div className="w-20 h-1.5 bg-azul/30 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-dorado rounded-full transition-all"
              style={{ width: `${completados / Math.max(partidos.length, 1) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selector de grupos */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {grupos.map(g => {
          const partidosG = partidos.filter(p => p.grupo === g)
          const completadosG = partidosG.filter(p => datos.pronosticos[p.id] !== undefined).length
          const listo = completadosG === partidosG.length
          return (
            <button
              key={g}
              onClick={() => setGrupoActual(g)}
              className={`flex-shrink-0 w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                grupoActual === g
                  ? 'bg-dorado text-oscuro'
                  : listo
                  ? 'bg-azul/40 text-white border border-azul/50'
                  : 'bg-naval text-white/60 border border-azul/20'
              }`}
            >
              {listo && grupoActual !== g ? '✓' : g}
            </button>
          )
        })}
      </div>

      {/* Partidos del grupo */}
      <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
        <div className="bg-azul/20 px-4 py-2.5 border-b border-azul/30">
          <h3 className="font-black text-white">Grupo {grupoActual}</h3>
        </div>
        <div className="divide-y divide-azul/20">
          {partidosGrupo.map(partido => {
            const pron = datos.pronosticos[partido.id] ?? { goles_local: 0, goles_visitante: 0 }
            return (
              <div key={partido.id} className="px-4 py-3">
                {partido.fecha && (
                  <p className="text-white/30 text-xs mb-2">{formatearFecha(partido.fecha)}</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-white/90 truncate text-right">
                      {BANDERAS[partido.equipo_local] || '🏳️'} {partido.equipo_local}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={pron.goles_local}
                      onChange={e => updatePronostico(partido.id, Math.max(0, parseInt(e.target.value) || 0), pron.goles_visitante)}
                      className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                    />
                  </div>
                  <div className="text-dorado font-bold text-lg flex-shrink-0">–</div>
                  <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={pron.goles_visitante}
                      onChange={e => updatePronostico(partido.id, pron.goles_local, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
                      {BANDERAS[partido.equipo_visitante] || '🏳️'} {partido.equipo_visitante}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Navegación entre grupos */}
      <div className="flex gap-2">
        {grupoIdx > 0 && (
          <button
            onClick={() => setGrupoActual(grupos[grupoIdx - 1])}
            className="flex-1 border border-azul/50 text-white py-3 rounded-xl font-semibold hover:bg-azul/20 transition-colors text-sm"
          >
            ← Grupo {grupos[grupoIdx - 1]}
          </button>
        )}
        {grupoIdx < grupos.length - 1 ? (
          <button
            onClick={() => setGrupoActual(grupos[grupoIdx + 1])}
            className="flex-1 bg-azul text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
          >
            Grupo {grupos[grupoIdx + 1]} →
          </button>
        ) : (
          <button
            onClick={handleSiguiente}
            className="flex-1 bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors active:scale-95"
          >
            Siguiente →
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onAnterior} className="flex-1 border-2 border-azul/50 text-white/60 font-semibold py-2 rounded-xl hover:bg-azul/10 transition-colors text-sm">
          ← Atrás
        </button>
        {grupoIdx === grupos.length - 1 && completados < partidos.length && (
          <button
            onClick={handleSiguiente}
            className="flex-[2] border-2 border-dorado/50 text-dorado font-semibold py-2 rounded-xl hover:bg-dorado/10 transition-colors text-sm"
          >
            Continuar de todos modos →
          </button>
        )}
      </div>
    </div>
  )
}
