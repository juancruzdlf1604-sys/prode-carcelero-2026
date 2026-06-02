'use client'

import { useState } from 'react'
import { BANDERAS } from '@/lib/types'
import { coincideBonus } from '@/lib/puntos'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PartidoGrupoItem {
  ronda: number | null
  equipo_local: string
  equipo_visitante: string
  goles_local: number
  goles_visitante: number
  jugado: boolean
  goles_local_real: number | null
  goles_visitante_real: number | null
  fecha: string | null
  puntos: number | null
}

export interface GrupoItem {
  grupo: string
  partidos: PartidoGrupoItem[]
}

export interface PartidoElimItem {
  equipo_local: string
  equipo_visitante: string
  goles_local: number | null
  goles_visitante: number | null
  ganador_penales?: string | null
}

export interface RondaItem {
  ronda: string
  label: string
  partidos: PartidoElimItem[]
}

export interface BonusData {
  campeon: string
  subcampeon: string
  goleador: string
  guante_oro: string
  mejor_joven: string
  mejor_jugador?: string
}

export interface ResultBonusData {
  campeon?: string | null
  subcampeon?: string | null
  goleador?: string | null
  guante_oro?: string | null
  mejor_joven?: string | null
  mejor_jugador?: string | null
}

interface Props {
  participante: { nombre: string; apellido: string; codigo: string }
  totalPuntos: number
  puntosGrupos: number
  puntosBonus: number
  exactosGrupos: number
  grupos: GrupoItem[]
  rondas: RondaItem[]
  bonus: BonusData | null
  resultBonus: ResultBonusData | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatFecha(fecha: string | null): string {
  if (!fecha) return '—'
  const parts = fecha.split('T')[0].split('-')
  if (parts.length < 3) return '—'
  return `${parseInt(parts[2])} ${MESES[parseInt(parts[1])]}`
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MiProdeCliente({
  participante, totalPuntos, puntosGrupos, puntosBonus, exactosGrupos,
  grupos, rondas, bonus, resultBonus,
}: Props) {
  const [openGrupos, setOpenGrupos] = useState<Set<string>>(new Set())
  const [openRondas, setOpenRondas] = useState<Set<string>>(new Set())

  function toggleGrupo(g: string) {
    setOpenGrupos(prev => {
      const next = new Set(prev)
      if (next.has(g)) { next.delete(g) } else { next.add(g) }
      return next
    })
  }

  function toggleRonda(r: string) {
    setOpenRondas(prev => {
      const next = new Set(prev)
      if (next.has(r)) { next.delete(r) } else { next.add(r) }
      return next
    })
  }

  return (
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
            <BonusRow emoji="🏆" label="Campeón" value={bonus.campeon} real={resultBonus?.campeon} pts={100} />
            <BonusRow emoji="🥈" label="Subcampeón" value={bonus.subcampeon} real={resultBonus?.subcampeon} pts={50} />
            <BonusRow emoji="⚽" label="Goleador" value={bonus.goleador} real={resultBonus?.goleador} pts={50} />
            <BonusRow emoji="🧤" label="Guante de Oro" value={bonus.guante_oro} real={resultBonus?.guante_oro} pts={50} />
            <BonusRow emoji="⭐" label="Mejor Joven" value={bonus.mejor_joven} real={resultBonus?.mejor_joven} pts={50} />
            <BonusRow emoji="🏅" label="Balón de Oro" value={bonus.mejor_jugador ?? ''} real={resultBonus?.mejor_jugador} pts={50} />
          </div>
        </div>
      )}

      {/* Fase de grupos */}
      <div className="space-y-2">
        <h2 className="text-dorado font-bold text-sm uppercase tracking-wider px-1">⚽ Fase de grupos</h2>
        {grupos.length === 0 ? (
          <div className="bg-naval rounded-xl border border-azul/30 px-4 py-6 text-center text-white/30 text-sm">
            No hay pronósticos de grupos cargados
          </div>
        ) : (
          grupos.map(({ grupo, partidos }) => {
            const isOpen = openGrupos.has(grupo)
            const puntosGrupo = partidos.reduce((sum, p) => sum + (p.puntos ?? 0), 0)
            const jugados = partidos.filter(p => p.jugado).length
            return (
              <div key={grupo} className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
                <button
                  onClick={() => toggleGrupo(grupo)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-azul/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">Grupo {grupo}</span>
                    {jugados > 0 && (
                      <span className="text-green-400 text-xs font-bold">+{puntosGrupo} pts</span>
                    )}
                    <span className="text-white/30 text-xs">{jugados}/{partidos.length} jugados</span>
                  </div>
                  <span className={`text-white/50 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-azul/10 border-t border-azul/20">
                    {partidos.map((d, i) => (
                      <div key={i} className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {/* Ronda */}
                          <span className="text-white/30 text-xs w-5 flex-shrink-0 text-center">F{d.ronda}</span>

                          {/* Local */}
                          <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
                            <span className="text-white/75 text-xs truncate text-right">{d.equipo_local}</span>
                            <span className="text-sm flex-shrink-0">{BANDERAS[d.equipo_local] || '🏳️'}</span>
                          </div>

                          {/* Marcador pronosticado */}
                          <div className="w-14 text-center flex-shrink-0">
                            <span className="font-black text-white text-sm">{d.goles_local} - {d.goles_visitante}</span>
                          </div>

                          {/* Visitante */}
                          <div className="flex-1 flex items-center justify-start gap-1 min-w-0">
                            <span className="text-sm flex-shrink-0">{BANDERAS[d.equipo_visitante] || '🏳️'}</span>
                            <span className="text-white/75 text-xs truncate">{d.equipo_visitante}</span>
                          </div>

                          {/* Puntos o fecha */}
                          <div className="w-12 text-right flex-shrink-0">
                            {d.puntos !== null ? (
                              <PuntajeBadge puntos={d.puntos} />
                            ) : (
                              <span className="text-white/25 text-xs">{formatFecha(d.fecha)}</span>
                            )}
                          </div>
                        </div>

                        {/* Resultado real */}
                        {d.jugado && (
                          <div className="mt-1 pl-6 flex justify-center">
                            <span className="text-white/30 text-xs">
                              Real: {d.goles_local_real} - {d.goles_visitante_real}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Eliminatorias */}
      <div className="space-y-2">
        <h2 className="text-dorado font-bold text-sm uppercase tracking-wider px-1">🏆 Fase eliminatoria</h2>
        {rondas.length === 0 ? (
          <div className="bg-naval rounded-xl border border-azul/30 px-4 py-6 text-center text-white/30 text-sm">
            No hay pronósticos de eliminatorias cargados
          </div>
        ) : (
          rondas.map(({ ronda, label, partidos }) => {
            const isOpen = openRondas.has(ronda)
            return (
              <div key={ronda} className="bg-naval rounded-xl border border-azul/30 overflow-hidden">
                <button
                  onClick={() => toggleRonda(ronda)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-azul/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">{label}</span>
                    <span className="text-white/30 text-xs">{partidos.length} {partidos.length === 1 ? 'partido' : 'partidos'}</span>
                  </div>
                  <span className={`text-white/50 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-azul/10 border-t border-azul/20">
                    {partidos.map((pe, i) => {
                      const esEmpate = pe.goles_local !== null && pe.goles_visitante !== null && pe.goles_local === pe.goles_visitante
                      return (
                        <div key={i} className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            {/* Local */}
                            <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
                              <span className="text-white/75 text-xs truncate text-right">{pe.equipo_local}</span>
                              <span className="text-sm flex-shrink-0">{BANDERAS[pe.equipo_local] || '🏳️'}</span>
                            </div>

                            {/* Marcador */}
                            <div className="w-14 text-center flex-shrink-0">
                              <span className="font-black text-white text-sm">
                                {pe.goles_local ?? '?'} - {pe.goles_visitante ?? '?'}
                              </span>
                            </div>

                            {/* Visitante */}
                            <div className="flex-1 flex items-center justify-start gap-1 min-w-0">
                              <span className="text-sm flex-shrink-0">{BANDERAS[pe.equipo_visitante] || '🏳️'}</span>
                              <span className="text-white/75 text-xs truncate">{pe.equipo_visitante}</span>
                            </div>

                            <div className="w-12 flex-shrink-0" />
                          </div>
                          {esEmpate && (
                            <div className="mt-1 text-center">
                              {pe.ganador_penales ? (
                                <span className="text-white/50 text-xs">
                                  Avanza {BANDERAS[pe.ganador_penales] || ''} <span className="font-semibold text-white/70">{pe.ganador_penales}</span> por penales
                                </span>
                              ) : (
                                <span className="text-white/30 text-xs italic">+ definición por penales</span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Link a tabla */}
      <div className="text-center py-2">
        <Link href="/tabla" className="text-dorado text-sm underline underline-offset-2">
          Ver tabla de posiciones →
        </Link>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BonusRow({
  emoji, label, value, real, pts,
}: {
  emoji: string; label: string; value: string; real?: string | null; pts: number
}) {
  const correcto = real ? coincideBonus(value, real) : false
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
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg border ${color}`}>
      {puntos > 0 ? `+${puntos}` : '0'}
    </span>
  )
}
