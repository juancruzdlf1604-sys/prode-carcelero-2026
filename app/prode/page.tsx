import Link from 'next/link'
import Header from '@/components/ui/Header'
import { PARTIDOS_GRUPOS, GRUPOS_DATA } from '@/lib/partidos-data'
import { BANDERAS } from '@/lib/types'

export default function ProdePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-6 w-full flex-1">
        <div className="mb-6">
          <Link href="/" className="text-white/40 text-xs hover:text-white/70 transition-colors">← Volver al inicio</Link>
          <h1 className="text-2xl font-black text-dorado mt-3">⚽ Fixture Mundial 2026</h1>
          <p className="text-white/50 text-sm mt-1">72 partidos · 12 grupos · 48 selecciones</p>
        </div>

        <div className="space-y-4">
          {Object.entries(GRUPOS_DATA).map(([grupo, equipos]) => {
            const partidos = PARTIDOS_GRUPOS.filter(p => p.grupo === grupo)
            return (
              <div key={grupo} className="bg-naval rounded-2xl border border-azul/30 overflow-hidden">
                <div className="bg-azul/20 px-4 py-3 border-b border-azul/30 flex items-center justify-between">
                  <h2 className="font-black text-white">Grupo {grupo}</h2>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {equipos.map(eq => (
                      <span key={eq} className="text-xs text-white/60 bg-azul/20 px-2 py-0.5 rounded-full">
                        {BANDERAS[eq] || '🏳️'} {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-azul/20">
                  {[1, 2, 3].map(ronda => {
                    const pts = partidos.filter(p => p.ronda === ronda)
                    return (
                      <div key={ronda} className="px-4 py-3">
                        <p className="text-dorado text-xs font-bold uppercase tracking-wider mb-2">Fecha {ronda}</p>
                        <div className="space-y-2">
                          {pts.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                                <span className="text-white/80 font-medium truncate text-right">
                                  {p.equipo_local}
                                </span>
                                <span className="text-lg flex-shrink-0">{BANDERAS[p.equipo_local] || '🏳️'}</span>
                              </div>
                              <div className="flex flex-col items-center px-3 flex-shrink-0">
                                <span className="text-white/40 font-bold text-xs">VS</span>
                                <span className="text-white/25 text-xs">{p.fecha.slice(5).replace('-', '/')}</span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="text-lg flex-shrink-0">{BANDERAS[p.equipo_visitante] || '🏳️'}</span>
                                <span className="text-white/80 font-medium truncate">
                                  {p.equipo_visitante}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/jugar"
            className="inline-block bg-dorado text-oscuro font-black px-8 py-4 rounded-xl text-lg hover:bg-yellow-400 transition-colors"
          >
            ⚽ ¡Hacé tu prode!
          </Link>
        </div>
      </div>

      <footer className="border-t border-azul/20 py-4 text-center mt-4">
        <p className="text-white/30 text-xs">Club San Carlos Rugby · Prode Carcelero 2026</p>
      </footer>
    </div>
  )
}
