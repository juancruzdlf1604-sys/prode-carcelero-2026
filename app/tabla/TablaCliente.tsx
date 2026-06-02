'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { calcularPuntosBonus } from '@/lib/puntos'
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
      { data: puntosRows },
      { data: bonuses },
      { data: resultBonus },
    ] = await Promise.all([
      supabase.from('participantes').select('id, codigo, nombre, apellido').eq('pago_confirmado', true).eq('eliminado', false),
      supabase.from('puntos_partidos').select('participante_id, puntos'),
      supabase.from('bonus').select('*'),
      supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
    ])

    if (!participantes) return

    // Build a map of participante_id -> { total puntos, exactos count }
    const puntosMap = new Map<string, { total: number; exactos: number }>()
    puntosRows?.forEach(row => {
      const entry = puntosMap.get(row.participante_id) ?? { total: 0, exactos: 0 }
      entry.total += row.puntos
      if (row.puntos === 10) entry.exactos++
      puntosMap.set(row.participante_id, entry)
    })

    const bonusMap = new Map<string, Bonus>()
    bonuses?.forEach(b => bonusMap.set(b.participante_id, b))

    const rb = resultBonus as ResultadosBonus | null

    const nuevaTabla: EntradaTabla[] = participantes.map(p => {
      const pts = puntosMap.get(p.id) ?? { total: 0, exactos: 0 }

      const bonus = bonusMap.get(p.id)
      const pts_bonus = bonus && rb ? calcularPuntosBonus(bonus, rb) : 0

      return {
        codigo: p.codigo,
        nombre: p.nombre,
        apellido: p.apellido,
        puntos: pts.total + pts_bonus,
        exactos: pts.exactos,
      }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puntos_partidos' }, calcular)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participantes' }, calcular)
      .subscribe()

    const interval = setInterval(calcular, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-dorado">🏆 Tabla de Posiciones</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {ultimaActualizacion
              ? `Actualizado ${ultimaActualizacion.toLocaleTimeString('es-AR')}`
              : 'Actualizando...'}
            {' '}· Tiempo real
          </p>
        </div>
        <button
          onClick={calcular}
          className="flex-shrink-0 text-xs text-dorado/70 border border-dorado/30 px-3 py-1.5 rounded-lg hover:bg-dorado/10 transition-colors mt-1"
        >
          ↻ Actualizar
        </button>
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
