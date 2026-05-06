'use client'

import { useState, useEffect } from 'react'

// 11 de junio de 2026 a las 21:00 hs Argentina (UTC-3)
const TARGET = new Date('2026-06-11T21:00:00-03:00').getTime()

interface Tiempo {
  dias: number
  horas: number
  minutos: number
  segundos: number
  terminado: boolean
}

function calcular(): Tiempo {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true }
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
    terminado: false,
  }
}

export default function Countdown() {
  const [tiempo, setTiempo] = useState<Tiempo>(calcular)

  useEffect(() => {
    const id = setInterval(() => setTiempo(calcular()), 1000)
    return () => clearInterval(id)
  }, [])

  if (tiempo.terminado) {
    return (
      <section className="bg-gradient-to-r from-dorado/20 via-naval to-dorado/20 border-y border-dorado/30 py-6 px-4 text-center">
        <p className="text-dorado font-black text-2xl">🏆 ¡El Mundial ya empezó!</p>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-b from-naval/80 to-oscuro border-y border-azul/30 py-8 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-white/50 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          Faltan para el Mundial 2026
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Unidad valor={tiempo.dias} label="DÍAS" />
          <Unidad valor={tiempo.horas} label="HS" />
          <Unidad valor={tiempo.minutos} label="MIN" />
          <Unidad valor={tiempo.segundos} label="SEG" />
        </div>

        <p className="text-white/30 text-xs">
          11 de junio de 2026 · 21:00 hs Argentina
        </p>
      </div>
    </section>
  )
}

function Unidad({ valor, label }: { valor: number; label: string }) {
  const str = valor.toString().padStart(2, '0')
  return (
    <div className="bg-naval border border-dorado/20 rounded-xl py-3 px-1 flex flex-col items-center shadow-inner shadow-oscuro/50">
      <span className="text-dorado font-black text-3xl sm:text-4xl tabular-nums leading-none">
        {str}
      </span>
      <span className="text-white/30 text-[10px] font-bold tracking-widest mt-1.5">
        {label}
      </span>
    </div>
  )
}
