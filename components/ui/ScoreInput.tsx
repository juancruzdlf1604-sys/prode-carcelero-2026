'use client'

import { BANDERAS } from '@/lib/types'

interface ScoreInputProps {
  equipoLocal: string
  equipoVisitante: string
  golesLocal: number
  golesVisitante: number
  onChange: (local: number, visitante: number) => void
  disabled?: boolean
  compact?: boolean
}

export default function ScoreInput({
  equipoLocal,
  equipoVisitante,
  golesLocal,
  golesVisitante,
  onChange,
  disabled = false,
  compact = false,
}: ScoreInputProps) {
  const handleChange = (side: 'local' | 'visitante', val: string) => {
    const n = Math.max(0, parseInt(val) || 0)
    if (side === 'local') onChange(n, golesVisitante)
    else onChange(golesLocal, n)
  }

  return (
    <div className={`flex items-center justify-between gap-2 ${compact ? 'py-1' : 'py-2'}`}>
      {/* Local */}
      <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
        <span className="text-xs sm:text-sm font-semibold text-white/90 truncate text-right">
          {BANDERAS[equipoLocal] || '🏳️'} {equipoLocal}
        </span>
        <input
          type="number"
          min={0}
          max={99}
          value={golesLocal}
          onChange={e => handleChange('local', e.target.value)}
          disabled={disabled}
          className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors disabled:opacity-50"
        />
      </div>

      {/* Separador */}
      <div className="text-dorado font-bold text-xl flex-shrink-0">–</div>

      {/* Visitante */}
      <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0">
        <input
          type="number"
          min={0}
          max={99}
          value={golesVisitante}
          onChange={e => handleChange('visitante', e.target.value)}
          disabled={disabled}
          className="w-12 h-10 text-center text-lg font-bold bg-oscuro border-2 border-azul/50 focus:border-dorado text-white rounded-lg outline-none transition-colors disabled:opacity-50"
        />
        <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
          {BANDERAS[equipoVisitante] || '🏳️'} {equipoVisitante}
        </span>
      </div>
    </div>
  )
}
