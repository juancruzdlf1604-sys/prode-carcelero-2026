import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer as supabase } from '@/lib/supabase/server'
import RayasDecorativas, { RayasHorizontales } from '@/components/ui/RayasDecorativos'
import Header from '@/components/ui/Header'
import Countdown from '@/components/ui/Countdown'

// Siempre server-render: los valores de config deben estar frescos
export const dynamic = 'force-dynamic'

async function getConfig() {
  const { data } = await supabase.from('configuracion').select('clave, valor')
  const config: Record<string, string> = {}
  data?.forEach(r => { config[r.clave] = r.valor })
  return config
}

async function getStats() {
  const [{ count: totalParticipantes }, { data: partidos }] = await Promise.all([
    supabase.from('participantes').select('*', { count: 'exact', head: true }).eq('pago_confirmado', true),
    supabase.from('partidos').select('jugado').eq('fase', 'grupos'),
  ])
  const jugados = partidos?.filter(p => p.jugado).length ?? 0
  const total = partidos?.length ?? 72
  return { totalParticipantes: totalParticipantes ?? 0, jugados, total }
}

export default async function HomePage() {
  let config: Record<string, string> = {}
  let stats = { totalParticipantes: 0, jugados: 0, total: 72 }

  try {
    ;[config, stats] = await Promise.all([getConfig(), getStats()])
  } catch {
    // Supabase no configurado aún
  }

  const precio = config.precio_inscripcion ?? '30000'
  const premio1 = config.premio_primero ?? 'Por definir'
  const premio2 = config.premio_segundo ?? 'Por definir'
  const premio3 = config.premio_tercero ?? 'Por definir'
  const prodeAbierto = config.prode_abierto !== 'false'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/club-1.jpeg"
            alt="Club San Carlos"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-oscuro/60 via-naval/80 to-oscuro" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-dorado/30 blur-xl scale-150" />
              <Image
                src="/assets/logo/logo.jpg"
                alt="Club San Carlos"
                width={100}
                height={100}
                className="relative rounded-full border-4 border-dorado shadow-2xl"
              />
            </div>
          </div>

          <p className="text-dorado text-xs font-bold tracking-[0.3em] uppercase mb-2">Club San Carlos Rugby</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-2">
            PRODE<br />
            <span className="text-dorado">CARCELERO</span><br />
            2026
          </h1>
          <p className="text-white/60 text-sm mb-6">
            El prode oficial del Mundial · Recaudación para el plantel superior
          </p>

          {prodeAbierto ? (
            <Link href="/jugar" className="inline-block bg-dorado text-oscuro font-black text-lg px-8 py-4 rounded-xl shadow-lg shadow-dorado/30 hover:bg-yellow-400 transition-colors active:scale-95">
              ⚽ ¡HACÉ TU PRODE!
            </Link>
          ) : (
            <div className="bg-red-900/50 border border-red-500/50 rounded-xl px-6 py-4 text-red-300 font-semibold">
              ⛔ El prode está cerrado
            </div>
          )}

          <p className="text-white/40 text-xs mt-3">Cierra el 11 de junio de 2026</p>
        </div>
      </section>

      <RayasDecorativas />

      <Countdown />

      {/* Stats */}
      <section className="bg-naval py-6 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <StatCard value={stats.totalParticipantes.toString()} label="Participantes" />
          <StatCard value={`${stats.jugados}/${stats.total}`} label="Partidos jugados" />
          <StatCard value={`$${parseInt(precio).toLocaleString('es-AR')}`} label="Inscripción" />
        </div>
      </section>

      <RayasHorizontales />

      {/* Premios */}
      <section className="max-w-2xl mx-auto px-4 py-8 w-full">
        <h2 className="text-2xl font-black text-dorado text-center mb-6">🏆 PREMIOS</h2>
        <div className="grid gap-3">
          <PremioCard posicion="1°" premio={premio1} emoji="🥇" colorClass="from-yellow-600/20 to-dorado/10 border-dorado/40" />
          <PremioCard posicion="2°" premio={premio2} emoji="🥈" colorClass="from-slate-500/20 to-slate-400/10 border-slate-400/40" />
          <PremioCard posicion="3°" premio={premio3} emoji="🥉" colorClass="from-orange-800/20 to-orange-700/10 border-orange-700/40" />
        </div>
        <div className="mt-5 text-center">
          <Link href="/premios" className="inline-flex items-center gap-2 border border-dorado/50 text-dorado font-semibold px-5 py-2.5 rounded-xl hover:bg-dorado hover:text-oscuro transition-colors text-sm">
            🎁 Conocer todos los premios →
          </Link>
        </div>
      </section>

      {/* Sistema de puntos */}
      <section className="bg-naval/50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-dorado text-center mb-6">📊 SISTEMA DE PUNTOS</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-naval rounded-xl p-4 border border-azul/30">
              <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3">Fase de Grupos</h3>
              <div className="space-y-2">
                <PuntosRow label="Resultado exacto" puntos="10 pts" />
                <PuntosRow label="Acertás el ganador" puntos="5 pts" />
                <PuntosRow label="No acertás" puntos="0 pts" />
              </div>
            </div>
            <div className="bg-naval rounded-xl p-4 border border-azul/30">
              <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3">Fase Eliminatoria</h3>
              <div className="space-y-2">
                <PuntosRow label="Ambos equipos correctos" puntos="10 pts" />
                <PuntosRow label="+ Ganador correcto" puntos="+10 pts" />
                <PuntosRow label="+ Resultado exacto" puntos="+20 pts" />
              </div>
            </div>
          </div>
          <div className="bg-naval rounded-xl p-4 border border-azul/30 mt-4">
            <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3">Bonus Iniciales</h3>
            <div className="grid grid-cols-2 gap-2">
              <PuntosRow label="🏆 Campeón" puntos="100 pts" />
              <PuntosRow label="🥈 Subcampeón" puntos="50 pts" />
              <PuntosRow label="⚽ Goleador" puntos="50 pts" />
              <PuntosRow label="🧤 Guante de Oro" puntos="50 pts" />
              <PuntosRow label="⭐ Mejor Joven" puntos="50 pts" />
              <PuntosRow label="🏅 Balón de Oro" puntos="50 pts" />
            </div>
          </div>
        </div>
      </section>

      {/* Fotos del club */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
          {[2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} className="aspect-square rounded-lg overflow-hidden">
              <Image
                src={`/assets/images/club-${n}.jpeg`}
                alt="Club San Carlos"
                width={200}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-naval py-10 px-4 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-white/60 text-sm mb-4">
            Una vez que mandás el prode, recibís tu código único y el alias para transferir.
          </p>
          {prodeAbierto && (
            <Link href="/jugar" className="inline-block bg-dorado text-oscuro font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
              ⚽ Participar ahora
            </Link>
          )}
          <div className="mt-6">
            <Link href="/tabla" className="text-dorado text-sm underline underline-offset-2">
              Ver tabla de posiciones →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-azul/20 py-4 text-center">
        <p className="text-white/30 text-xs">
          Club San Carlos Rugby · Prode Carcelero 2026
        </p>
      </footer>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-black text-dorado">{value}</div>
      <div className="text-white/60 text-xs mt-0.5">{label}</div>
    </div>
  )
}

function PremioCard({ posicion, premio, emoji, colorClass }: { posicion: string; premio: string; emoji: string; colorClass: string }) {
  return (
    <div className={`bg-gradient-to-r ${colorClass} border rounded-xl p-4 flex items-center gap-4`}>
      <span className="text-3xl">{emoji}</span>
      <div>
        <div className="text-white/50 text-xs font-semibold">{posicion} PUESTO</div>
        <div className="text-white font-bold">{premio}</div>
      </div>
    </div>
  )
}

function PuntosRow({ label, puntos }: { label: string; puntos: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/70">{label}</span>
      <span className="font-bold text-dorado">{puntos}</span>
    </div>
  )
}
