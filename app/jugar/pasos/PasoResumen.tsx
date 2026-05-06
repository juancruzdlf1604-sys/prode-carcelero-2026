'use client'

import type { DatosProde } from '../FormularioProde'

interface Props {
  datos: DatosProde
  totalPartidos: number
  onEnviar: () => void
  onAnterior: () => void
  enviando: boolean
  error: string
}

export default function PasoResumen({ datos, totalPartidos, onEnviar, onAnterior, enviando, error }: Props) {
  const completados = Object.keys(datos.pronosticos).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">📋 Revisión final</h2>
        <p className="text-white/50 text-sm">Verificá todo antes de enviar — no se puede modificar</p>
      </div>

      {/* Datos personales */}
      <div className="bg-naval rounded-xl border border-azul/30 p-4">
        <h3 className="text-dorado font-bold text-sm uppercase tracking-wider mb-3">👤 Tus datos</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Nombre</span>
            <span className="font-semibold">{datos.nombre} {datos.apellido}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">WhatsApp</span>
            <span className="font-semibold">{datos.whatsapp}</span>
          </div>
        </div>
      </div>

      {/* Bonus */}
      <div className="bg-naval rounded-xl border border-azul/30 p-4">
        <h3 className="text-dorado font-bold text-sm uppercase tracking-wider mb-3">🎯 Bonus</h3>
        <div className="space-y-1 text-sm">
          <BonusRow emoji="🏆" label="Campeón" value={datos.bonus.campeon} />
          <BonusRow emoji="🥈" label="Subcampeón" value={datos.bonus.subcampeon} />
          <BonusRow emoji="⚽" label="Goleador" value={datos.bonus.goleador} />
          <BonusRow emoji="🧤" label="Guante de Oro" value={datos.bonus.guante_oro} />
          <BonusRow emoji="⭐" label="Mejor Joven" value={datos.bonus.mejor_joven} />
        </div>
      </div>

      {/* Grupos resumen */}
      <div className="bg-naval rounded-xl border border-azul/30 p-4">
        <h3 className="text-dorado font-bold text-sm uppercase tracking-wider mb-2">⚽ Fase de Grupos</h3>
        <p className="text-white/50 text-sm">
          {completados}/{totalPartidos} partidos completados
          {completados < totalPartidos && (
            <span className="text-yellow-400 ml-2">⚠️ {totalPartidos - completados} sin completar (se guardan como 0-0)</span>
          )}
        </p>
      </div>

      {/* Eliminatorias resumen */}
      <div className="bg-naval rounded-xl border border-azul/30 p-4">
        <h3 className="text-dorado font-bold text-sm uppercase tracking-wider mb-2">🏆 Eliminatorias</h3>
        <p className="text-white/50 text-sm">
          {Object.keys(datos.eliminatorias).filter(k => datos.eliminatorias[k].equipo_local && datos.eliminatorias[k].equipo_visitante).length} cruces completados
        </p>
      </div>

      {/* Aviso */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-sm">
        <p className="text-red-300 font-semibold mb-1">⚠️ Atención</p>
        <p className="text-red-300/80">Una vez que enviás el prode, no podés modificarlo. Revisá todo antes de confirmar.</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onEnviar}
        disabled={enviando}
        className="w-full bg-dorado text-oscuro font-black py-4 rounded-xl text-lg hover:bg-yellow-400 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : '🚀 ¡ENVIAR MI PRODE!'}
      </button>

      <button onClick={onAnterior} disabled={enviando} className="w-full border border-azul/30 text-white/50 py-2 rounded-xl text-sm hover:bg-azul/10 transition-colors">
        ← Volver
      </button>
    </div>
  )
}

function BonusRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/50">{emoji} {label}</span>
      <span className={`font-semibold ${value ? 'text-white' : 'text-red-400'}`}>
        {value || 'Sin completar'}
      </span>
    </div>
  )
}
