'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { calcularPuntosGrupo, calcularPuntosBonus } from '@/lib/puntos'
import type { Bonus, ResultadosBonus } from '@/lib/types'

interface EntradaTabla {
  codigo: string
  nombre: string
  apellido: string
  puntos: number
  exactos: number
}

export default function TablaCliente() {
  const [tabla, setTabla] = useState<EntradaTabla[]>([])
  const [loading, setLoading] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const calcular = async () => {
    const [
      { data: participantes },
      { data: pronosticosGrupos },
      { data: partidos },
      { data: bonuses },
      { data: resultBonus },
    ] = await Promise.all([
      supabase.from('participantes').select('id, codigo, nombre, apellido').eq('pago_confirmado', true),
      supabase.from('pronosticos_grupos').select('participante_id, partido_id, goles_local, goles_visitante'),
      supabase.from('partidos').select('id, goles_local_real, goles_visitante_real, jugado').eq('jugado', true),
      supabase.from('bonus').select('*'),
      supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
    ])

    if (!participantes) return

    const partidosMap = new Map(
      (partidos || []).map(p => [p.id, p])
    )

    const pronMap = new Map<string, Array<{ partido_id: number; goles_local: number; goles_visitante: number }>>()
    pronosticosGrupos?.forEach(pg => {
      const arr = pronMap.get(pg.participante_id) || []
      arr.push(pg)
      pronMap.set(pg.participante_id, arr)
    })

    const bonusMap = new Map<string, Bonus>()
    bonuses?.forEach(b => bonusMap.set(b.participante_id, b))

    const rb = resultBonus as ResultadosBonus | null

    const nuevaTabla: EntradaTabla[] = participantes.map(p => {
      let puntos = 0
      let exactos = 0

      const prons = pronMap.get(p.id) || []
      prons.forEach(pg => {
        const partido = partidosMap.get(pg.partido_id)
        if (!partido) return
        const pts = calcularPuntosGrupo(
          { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante },
          { goles_local_real: partido.goles_local_real, goles_visitante_real: partido.goles_visitante_real }
        )
        puntos += pts
        if (pts === 10) exactos++
      })

      const bonus = bonusMap.get(p.id)
      if (bonus && rb) {
        puntos += calcularPuntosBonus(bonus, rb)
      }

      return { codigo: p.codigo, nombre: p.nombre, apellido: p.apellido, puntos, exactos }
    })

    nuevaTabla.sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos)
    setTabla(nuevaTabla)
    setUltimaActualizacion(new Date())
    setLoading(false)
  }

  useEffect(() => {
    calcular()

    const channel = supabase
      .channel('tabla-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, calcular)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participantes' }, calcular)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-black text-dorado">🏆 Tabla de Posiciones</h1>
        <p className="text-white/40 text-xs mt-0.5">
          {ultimaActualizacion
            ? `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-AR')}`
            : 'Actualizando...'}
          {' '}· Tiempo real
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/40">
          <div className="text-3xl mb-2">⏳</div>
          <p>Calculando posiciones...</p>
        </div>
      ) : tabla.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">⚽</div>
          <p>Todavía no hay participantes con pago confirmado</p>
          <Link href="/jugar" className="text-dorado text-sm underline mt-2 inline-block">
            ¡Hacé tu prode!
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tabla.map((entrada, i) => (
            <EntradaFila key={entrada.codigo} entrada={entrada} posicion={i + 1} />
          ))}
        </div>
      )}

      <div className="text-center pt-4">
        <Link href="/jugar" className="inline-block bg-dorado text-oscuro font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors text-sm">
          ⚽ Hacé tu prode
        </Link>
      </div>
    </div>
  )
}

function EntradaFila({ entrada, posicion }: { entrada: EntradaTabla; posicion: number }) {
  const medallaColor = posicion === 1 ? 'text-yellow-400' : posicion === 2 ? 'text-slate-300' : posicion === 3 ? 'text-orange-400' : 'text-white/30'

  return (
    <Link href={`/mi-prode/${entrada.codigo}`}>
      <div className={`bg-naval rounded-xl border transition-colors hover:border-dorado/40 p-4 flex items-center gap-3 ${
        posicion <= 3 ? 'border-dorado/20' : 'border-azul/20'
      }`}>
        <div className={`text-lg font-black w-8 text-center flex-shrink-0 ${medallaColor}`}>
          {posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : posicion}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{entrada.nombre} {entrada.apellido}</p>
          <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
            <span>{entrada.codigo}</span>
            <span>·</span>
            <span>{entrada.exactos} exactos</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-dorado font-black text-xl">{entrada.puntos}</div>
          <div className="text-white/30 text-xs">pts</div>
        </div>
      </div>
    </Link>
  )
}
