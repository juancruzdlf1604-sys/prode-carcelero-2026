'use client'

import { useState, useMemo } from 'react'
import type { DatosProde } from '../FormularioProde'
import { BANDERAS } from '@/lib/types'
import { PARTIDOS_GRUPOS, GRUPOS_DATA } from '@/lib/partidos-data'

interface Props {
  datos: DatosProde
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
  onAnterior: () => void
}

const GRUPOS = Object.keys(GRUPOS_DATA)
const TOTAL = PARTIDOS_GRUPOS.length

export default function PasoGrupos({ datos, onChange, onSiguiente, onAnterior }: Props) {
  const [grupoActual, setGrupoActual] = useState('A')
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)

  const guardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const completados = useMemo(
    () => PARTIDOS_GRUPOS.filter(p => datos.pronosticos[p.id] !== undefined).length,
    [datos.pronosticos]
  )

  const updatePronostico = (id: number, local: number, visitante: number) => {
    onChange({
      pronosticos: { ...datos.pronosticos, [id]: { goles_local: local, goles_visitante: visitante } },
    })
    setError('')
  }

  const handleSiguiente = () => {
    if (completados < TOTAL) {
      setError(`Faltan ${TOTAL - completados} partido${TOTAL - completados !== 1 ? 's' : ''} por completar.`)
      return
    }
    onSiguiente()
  }

  const grupoIdx = GRUPOS.indexOf(grupoActual)
  const partidosGrupo = PARTIDOS_GRUPOS.filter(p => p.grupo === grupoActual)

  return (
    <div className="space-y-4">
      {/* Header con progreso */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">⚽ Fase de Grupos</h2>
          <p className="text-white/50 text-xs">{completados}/{TOTAL} partidos completados</p>
        </div>
        <div className="text-right">
          <div className="text-dorado font-bold text-sm">{Math.round(completados / TOTAL * 100)}%</div>
          <div className="w-20 h-1.5 bg-azul/30 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-dorado rounded-full transition-all"
              style={{ width: `${completados / TOTAL * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selector de grupos */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {GRUPOS.map(g => {
          const pts = PARTIDOS_GRUPOS.filter(p => p.grupo === g)
          const comp = pts.filter(p => datos.pronosticos[p.id] !== undefined).length
          const listo = comp === pts.length
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

      {/* Partidos del grupo actual */}
      <div className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
        <div className="bg-azul/20 px-4 py-2.5 border-b border-azul/30 flex items-center justify-between">
          <h3 className="font-black text-white">Grupo {grupoActual}</h3>
          <span className="text-white/40 text-xs">
            {GRUPOS_DATA[grupoActual].join(' · ')}
          </span>
        </div>

        <div className="divide-y divide-azul/20">
          {partidosGrupo.map(partido => {
            const pron = datos.pronosticos[partido.id] ?? { goles_local: 0, goles_visitante: 0 }
            const completado = datos.pronosticos[partido.id] !== undefined
            return (
              <div key={partido.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/25 text-xs">
                    Fecha {partido.ronda} · {partido.fecha.slice(5).replace('-', '/')}
                  </span>
                  {completado && <span className="text-green-400 text-xs">✓</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-white/90 truncate text-right">
                      {BANDERAS[partido.equipo_local] || '🏳️'} {partido.equipo_local}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={99}
                      value={pron.goles_local}
                      onChange={e => updatePronostico(
                        partido.id,
                        Math.max(0, parseInt(e.target.value) || 0),
                        pron.goles_visitante
                      )}
                      onFocus={e => e.target.select()}
                      className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                    />
                  </div>
                  <div className="text-dorado font-bold text-lg flex-shrink-0">–</div>
                  <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={99}
                      value={pron.goles_visitante}
                      onChange={e => updatePronostico(
                        partido.id,
                        pron.goles_local,
                        Math.max(0, parseInt(e.target.value) || 0)
                      )}
                      onFocus={e => e.target.select()}
                      className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
                      {BANDERAS[partido.equipo_visitante] || '🏳️'} {partido.equipo_visitante}
                    </span>
                  </div>
                </div>
                {/* Botón para confirmar 0-0 en mobile (el onChange no se dispara si no se toca el input) */}
                {!completado && (
                  <button
                    onClick={() => updatePronostico(partido.id, 0, 0)}
                    className="mt-2 w-full text-xs text-white/30 hover:text-white/60 py-1.5 border border-azul/20 hover:border-azul/40 rounded-lg transition-colors"
                  >
                    Confirmar 0-0
                  </button>
                )}
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

      {/* Navegación entre grupos */}
      <div className="flex gap-2">
        {grupoIdx > 0 && (
          <button
            onClick={() => setGrupoActual(GRUPOS[grupoIdx - 1])}
            className="flex-1 border border-azul/50 text-white py-3 rounded-xl font-semibold hover:bg-azul/20 transition-colors text-sm"
          >
            ← Grupo {GRUPOS[grupoIdx - 1]}
          </button>
        )}
        {grupoIdx < GRUPOS.length - 1 ? (
          <button
            onClick={() => setGrupoActual(GRUPOS[grupoIdx + 1])}
            className="flex-1 bg-azul text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
          >
            Grupo {GRUPOS[grupoIdx + 1]} →
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
        <button
          onClick={onAnterior}
          className="flex-1 border-2 border-azul/50 text-white/60 font-semibold py-2 rounded-xl hover:bg-azul/10 transition-colors text-sm"
        >
          ← Atrás
        </button>
        {completados < TOTAL && (
          <button
            onClick={() => { setError(''); onSiguiente() }}
            className="flex-[2] border border-dorado/40 text-dorado/70 font-semibold py-2 rounded-xl hover:bg-dorado/10 transition-colors text-sm"
          >
            Continuar igual →
          </button>
        )}
      </div>
    </div>
  )
}
