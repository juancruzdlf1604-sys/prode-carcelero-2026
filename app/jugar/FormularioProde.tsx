'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Stepper from '@/components/ui/Stepper'
import PasoIdentidad from './pasos/PasoIdentidad'
import PasoBonus from './pasos/PasoBonus'
import PasoGrupos from './pasos/PasoGrupos'
import PasoEliminatorias from './pasos/PasoEliminatorias'
import PasoResumen from './pasos/PasoResumen'
import { supabase, isConfigured } from '@/lib/supabase/client'
import { PARTIDOS_GRUPOS } from '@/lib/partidos-data'

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
    mejor_jugador: string
  }
  pronosticos: Record<number, { goles_local: number; goles_visitante: number }>
  eliminatorias: Record<string, {
    fase: string
    slot: number
    equipo_local: string
    equipo_visitante: string
    goles_local: number
    goles_visitante: number
    ganador?: string
  }>
}

const PASOS = ['Datos', 'Grupos', 'Eliminatorias', 'Bonus', 'Resumen']

const datosIniciales: DatosProde = {
  nombre: '',
  apellido: '',
  whatsapp: '',
  bonus: { campeon: '', subcampeon: '', goleador: '', guante_oro: '', mejor_joven: '', mejor_jugador: '' },
  pronosticos: {},
  eliminatorias: {},
}

export default function FormularioProde() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState<DatosProde>(datosIniciales)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('prode-carcelero-2026')
      if (saved) {
        const { datos: d, paso: p } = JSON.parse(saved)
        if (d) setDatos(d)
        if (typeof p === 'number') setPaso(p)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('prode-carcelero-2026', JSON.stringify({ datos, paso }))
    } catch {}
  }, [datos, paso])

  const siguiente = () => setPaso(p => Math.min(p + 1, PASOS.length - 1))
  const anterior = () => setPaso(p => Math.max(p - 1, 0))

  const actualizarDatos = (parcial: Partial<DatosProde>) => {
    setDatos(prev => ({ ...prev, ...parcial }))
  }

  const enviarProde = async () => {
    setEnviando(true)
    setError('')

    if (!isConfigured()) {
      setError('Error de configuración: Supabase no está configurado. Contactá al organizador.')
      setEnviando(false)
      return
    }

    try {
      console.log('[enviarProde] Iniciando envío...')

      const { count, error: errCount } = await supabase
        .from('participantes')
        .select('*', { count: 'exact', head: true })

      if (errCount) {
        console.error('[enviarProde] Error al contar participantes:', errCount)
        throw new Error(`Error de conexión con la base de datos: ${errCount.message}`)
      }

      const numero = (count ?? 0) + 1
      const codigo = `SC-${String(numero).padStart(4, '0')}`
      console.log('[enviarProde] Código asignado:', codigo)

      const { data: participante, error: errPart } = await supabase
        .from('participantes')
        .insert({ codigo, nombre: datos.nombre, apellido: datos.apellido, whatsapp: datos.whatsapp })
        .select()
        .single()

      if (errPart || !participante) {
        console.error('[enviarProde] Error al insertar participante:', errPart)
        throw new Error(`Error al crear participante: ${errPart?.message || 'sin respuesta del servidor'}`)
      }
      console.log('[enviarProde] Participante creado:', participante.id)

      const { error: errBonus } = await supabase.from('bonus').insert({
        participante_id: participante.id,
        ...datos.bonus,
      })
      if (errBonus) console.error('[enviarProde] Error al insertar bonus:', errBonus)

      const pronosticosGrupos = Object.entries(datos.pronosticos).map(([partido_id, goles]) => ({
        participante_id: participante.id,
        partido_id: parseInt(partido_id),
        goles_local: goles.goles_local,
        goles_visitante: goles.goles_visitante,
      }))
      if (pronosticosGrupos.length > 0) {
        const { error: errGrupos } = await supabase.from('pronosticos_grupos').insert(pronosticosGrupos)
        if (errGrupos) {
          console.error('[enviarProde] Error al insertar pronosticos_grupos:', errGrupos)
          throw new Error(`Error al guardar pronósticos de grupos: ${errGrupos.message}`)
        }
        console.log('[enviarProde] Pronósticos grupos insertados:', pronosticosGrupos.length)
      }

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
        const { error: errElim } = await supabase.from('pronosticos_eliminatorias').insert(pronosticosElim)
        if (errElim) console.error('[enviarProde] Error al insertar pronosticos_eliminatorias:', errElim)
        console.log('[enviarProde] Pronósticos eliminatorias insertados:', pronosticosElim.length)
      }

      console.log('[enviarProde] Envío completado. Redirigiendo a /exito/' + codigo)
      localStorage.removeItem('prode-carcelero-2026')
      router.push(`/exito/${codigo}`)
    } catch (e: unknown) {
      console.error('[enviarProde] Error general:', e)
      const msg = e instanceof Error ? e.message : String(e)
      setError(`Error al enviar: ${msg}`)
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
          <PasoIdentidad datos={datos} onChange={actualizarDatos} onSiguiente={siguiente} />
        )}
        {paso === 1 && (
          <PasoGrupos datos={datos} onChange={actualizarDatos} onSiguiente={siguiente} onAnterior={anterior} />
        )}
        {paso === 2 && (
          <PasoEliminatorias datos={datos} onChange={actualizarDatos} onSiguiente={siguiente} onAnterior={anterior} />
        )}
        {paso === 3 && (
          <PasoBonus datos={datos} onChange={actualizarDatos} onSiguiente={siguiente} onAnterior={anterior} />
        )}
        {paso === 4 && (
          <PasoResumen
            datos={datos}
            totalPartidos={PARTIDOS_GRUPOS.length}
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
