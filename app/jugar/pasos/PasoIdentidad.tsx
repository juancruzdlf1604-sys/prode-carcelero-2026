'use client'

import { useState } from 'react'
import type { DatosProde } from '../FormularioProde'

interface Props {
  datos: DatosProde
  onChange: (parcial: Partial<DatosProde>) => void
  onSiguiente: () => void
}

export default function PasoIdentidad({ datos, onChange, onSiguiente }: Props) {
  const [errores, setErrores] = useState<Record<string, string>>({})

  const validar = () => {
    const e: Record<string, string> = {}
    if (!datos.nombre.trim()) e.nombre = 'Ingresá tu nombre'
    if (!datos.apellido.trim()) e.apellido = 'Ingresá tu apellido'
    if (!datos.whatsapp.trim()) e.whatsapp = 'Ingresá tu WhatsApp'
    else if (!/^\+?[\d\s\-]{8,}$/.test(datos.whatsapp)) e.whatsapp = 'Número inválido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSiguiente = () => {
    if (validar()) onSiguiente()
  }

  return (
    <div className="space-y-6">
      <div className="bg-naval rounded-2xl p-6 border border-azul/30">
        <h2 className="text-xl font-black text-white mb-1">👤 Tus datos</h2>
        <p className="text-white/50 text-sm mb-6">Sin registro — solo tu nombre y WhatsApp</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white/70 mb-1.5 block">Nombre</label>
            <input
              type="text"
              value={datos.nombre}
              onChange={e => onChange({ nombre: e.target.value })}
              placeholder="Juan"
              className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado transition-colors placeholder:text-white/30"
            />
            {errores.nombre && <p className="text-red-400 text-xs mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70 mb-1.5 block">Apellido</label>
            <input
              type="text"
              value={datos.apellido}
              onChange={e => onChange({ apellido: e.target.value })}
              placeholder="García"
              className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado transition-colors placeholder:text-white/30"
            />
            {errores.apellido && <p className="text-red-400 text-xs mt-1">{errores.apellido}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70 mb-1.5 block">WhatsApp</label>
            <input
              type="tel"
              value={datos.whatsapp}
              onChange={e => onChange({ whatsapp: e.target.value })}
              placeholder="+54 9 11 1234-5678"
              className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado transition-colors placeholder:text-white/30"
            />
            {errores.whatsapp && <p className="text-red-400 text-xs mt-1">{errores.whatsapp}</p>}
            <p className="text-white/30 text-xs mt-1">Con código de área, sin el 0</p>
          </div>
        </div>
      </div>

      <div className="bg-azul/10 border border-azul/30 rounded-xl p-4 text-sm text-white/60">
        <p>🔒 Tus datos solo se usan para identificarte en el prode y avisarte si ganás.</p>
      </div>

      <button onClick={handleSiguiente} className="w-full bg-dorado text-oscuro font-black py-4 rounded-xl text-lg hover:bg-yellow-400 transition-colors active:scale-95">
        Siguiente →
      </button>
    </div>
  )
}
