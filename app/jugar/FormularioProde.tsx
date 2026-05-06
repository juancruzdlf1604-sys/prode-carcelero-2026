'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Stepper from '@/components/ui/Stepper'
import PasoIdentidad from './pasos/PasoIdentidad'
import PasoBonus from './pasos/PasoBonus'
import PasoGrupos from './pasos/PasoGrupos'
import PasoEliminatorias from './pasos/PasoEliminatorias'
import PasoResumen from './pasos/PasoResumen'
import type { Partido } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

export interface DatosProde {
  nombre: string
  apellido: string
  whatsapp: string
  bonus: {
    campeon: string
    subcampeon: string
    goleador: string
    guante_oro: string
    mejor_joven: string
  }
  pronosticos: Record<number, { goles_local: number; goles_visitante: number }>
  eliminatorias: Record<string, {
    fase: string
    slot: number
    equipo_local: string
    equipo_visitante: string
    goles_local: number
    goles_visitante: number
  }>
}

const PASOS = ['Datos', 'Bonus', 'Grupos', 'Eliminatorias', 'Resumen']

const datosIniciales: DatosProde = {
  nombre: '',
  apellido: '',
  whatsapp: '',
  bonus: { campeon: '', subcampeon: '', goleador: '', guante_oro: '', mejor_joven: '' },
  pronosticos: {},
  eliminatorias: {},
}

export default function FormularioProde() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState<DatosProde>(datosIniciales)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase
      .from('partidos')
      .select('*')
      .eq('fase', 'grupos')
      .order('grupo')
      .order('ronda')
      .then(({ data }) => {
        if (data) setPartidos(data)
      })
  }, [])

  const siguiente = () => setPaso(p => Math.min(p + 1, PASOS.length - 1))
  const anterior = () => setPaso(p => Math.max(p - 1, 0))

  const actualizarDatos = (parcial: Partial<DatosProde>) => {
    setDatos(prev => ({ ...prev, ...parcial }))
  }

  const enviarProde = async () => {
    setEnviando(true)
    setError('')
    try {
      // Obtener próximo número para el código
      const { count } = await supabase
        .from('participantes')
        .select('*', { count: 'exact', head: true })

      const numero = (count ?? 0) + 1
      const codigo = `SC-${String(numero).padStart(4, '0')}`

      // Insertar participante
      const { data: participante, error: errPart } = await supabase
        .from('participantes')
        .insert({ codigo, nombre: datos.nombre, apellido: datos.apellido, whatsapp: datos.whatsapp })
        .select()
        .single()

      if (errPart || !participante) throw new Error(errPart?.message || 'Error al crear participante')

      // Insertar bonus
      await supabase.from('bonus').insert({
        participante_id: participante.id,
        ...datos.bonus,
      })

      // Insertar pronósticos de grupos
      const pronosticosGrupos = Object.entries(datos.pronosticos).map(([partido_id, goles]) => ({
        participante_id: participante.id,
        partido_id: parseInt(partido_id),
        goles_local: goles.goles_local,
        goles_visitante: goles.goles_visitante,
      }))
      if (pronosticosGrupos.length > 0) {
        await supabase.from('pronosticos_grupos').insert(pronosticosGrupos)
      }

      // Insertar pronósticos eliminatorias
      const pronosticosElim = Object.values(datos.eliminatorias).map(e => ({
        participante_id: participante.id,
        fase: e.fase,
        slot: e.slot,
        equipo_local: e.equipo_local,
        equipo_visitante: e.equipo_visitante,
        goles_local: e.goles_local || null,
        goles_visitante: e.goles_visitante || null,
      }))
      if (pronosticosElim.length > 0) {
        await supabase.from('pronosticos_eliminatorias').insert(pronosticosElim)
      }

      router.push(`/mi-prode/${codigo}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <div className="mb-2 text-center">
        <h1 className="text-2xl font-black text-dorado">Tu Prode 2026</h1>
        <p className="text-white/50 text-sm">Completá todos los pasos para participar</p>
      </div>

      <div className="sticky top-16 z-10 bg-oscuro/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-azul/20 mb-6">
        <Stepper pasos={PASOS} pasoActual={paso} />
      </div>

      <div className="animate-fadeIn">
        {paso === 0 && (
          <PasoIdentidad
            datos={datos}
            onChange={actualizarDatos}
            onSiguiente={siguiente}
          />
        )}
        {paso === 1 && (
          <PasoBonus
            datos={datos}
            onChange={actualizarDatos}
            onSiguiente={siguiente}
            onAnterior={anterior}
          />
        )}
        {paso === 2 && (
          <PasoGrupos
            datos={datos}
            partidos={partidos}
            onChange={actualizarDatos}
            onSiguiente={siguiente}
            onAnterior={anterior}
          />
        )}
        {paso === 3 && (
          <PasoEliminatorias
            datos={datos}
            onChange={actualizarDatos}
            onSiguiente={siguiente}
            onAnterior={anterior}
          />
        )}
        {paso === 4 && (
          <PasoResumen
            datos={datos}
            partidos={partidos}
            onEnviar={enviarProde}
            onAnterior={anterior}
            enviando={enviando}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
