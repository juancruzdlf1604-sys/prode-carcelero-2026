'use client'

interface StepperProps {
  pasos: string[]
  pasoActual: number
}

export default function Stepper({ pasos, pasoActual }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto py-2 px-4">
      {pasos.map((paso, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < pasoActual
                  ? 'bg-dorado text-oscuro'
                  : i === pasoActual
                  ? 'bg-azul text-white ring-2 ring-dorado'
                  : 'bg-naval/60 text-white/40 border border-azul/30'
              }`}
            >
              {i < pasoActual ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i === pasoActual ? 'text-dorado font-semibold' : 'text-white/40'}`}>
              {paso}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 mb-4 ${i < pasoActual ? 'bg-dorado' : 'bg-azul/30'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
