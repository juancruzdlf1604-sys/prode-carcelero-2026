import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import RayasDecorativas, { RayasHorizontales } from '@/components/ui/RayasDecorativos'
import { supabase } from '@/lib/supabase/client'

async function getConfig() {
  try {
    const { data } = await supabase.from('configuracion').select('clave, valor')
    const config: Record<string, string> = {}
    data?.forEach(r => { config[r.clave] = r.valor })
    return config
  } catch {
    return {}
  }
}

// Premios placeholder — se reemplazarán desde el admin
const PREMIOS_PLACEHOLDER = [
  {
    puesto: 1,
    emoji: '🥇',
    nombre: 'Premio Mayor',
    descripcion: 'El gran ganador del Prode Carcelero 2026 se lleva el premio principal. ¡A acertar todos los resultados!',
    imagen: '/assets/images/club-8.jpeg',
    colorBorde: 'border-yellow-500/50',
    colorBg: 'from-yellow-900/20 to-yellow-800/10',
    colorTexto: 'text-yellow-400',
    size: 'grande',
  },
  {
    puesto: 2,
    emoji: '🥈',
    nombre: 'Segundo Premio',
    descripcion: 'El subcampeón del prode también tiene su recompensa bien merecida.',
    imagen: '/assets/images/club-9.jpeg',
    colorBorde: 'border-slate-400/50',
    colorBg: 'from-slate-700/20 to-slate-600/10',
    colorTexto: 'text-slate-300',
    size: 'mediano',
  },
  {
    puesto: 3,
    emoji: '🥉',
    nombre: 'Tercer Premio',
    descripcion: 'Tercer lugar en la tabla de posiciones. ¡El podio del Prode Carcelero!',
    imagen: '/assets/images/club-10.jpeg',
    colorBorde: 'border-orange-600/50',
    colorBg: 'from-orange-900/20 to-orange-800/10',
    colorTexto: 'text-orange-400',
    size: 'mediano',
  },
  {
    puesto: 4,
    emoji: '🎖️',
    nombre: '4° Puesto',
    descripcion: 'Premio especial para el cuarto clasificado.',
    imagen: null,
    colorBorde: 'border-azul/40',
    colorBg: 'from-azul/10 to-naval/20',
    colorTexto: 'text-white/70',
    size: 'chico',
  },
  {
    puesto: 5,
    emoji: '🎖️',
    nombre: '5° Puesto',
    descripcion: 'Premio especial para el quinto clasificado.',
    imagen: null,
    colorBorde: 'border-azul/40',
    colorBg: 'from-azul/10 to-naval/20',
    colorTexto: 'text-white/70',
    size: 'chico',
  },
  {
    puesto: 6,
    emoji: '🎖️',
    nombre: '6° Puesto',
    descripcion: 'Premio especial para el sexto clasificado.',
    imagen: null,
    colorBorde: 'border-azul/40',
    colorBg: 'from-azul/10 to-naval/20',
    colorTexto: 'text-white/70',
    size: 'chico',
  },
  {
    puesto: 7,
    emoji: '⭐',
    nombre: 'Premio Sorpresa',
    descripcion: 'Premio especial a definir por los organizadores.',
    imagen: null,
    colorBorde: 'border-dorado/30',
    colorBg: 'from-dorado/10 to-naval/20',
    colorTexto: 'text-dorado/70',
    size: 'chico',
  },
  {
    puesto: 8,
    emoji: '⭐',
    nombre: 'Premio Sorpresa',
    descripcion: 'Premio especial a definir por los organizadores.',
    imagen: null,
    colorBorde: 'border-dorado/30',
    colorBg: 'from-dorado/10 to-naval/20',
    colorTexto: 'text-dorado/70',
    size: 'chico',
  },
  {
    puesto: 9,
    emoji: '⭐',
    nombre: 'Premio Sorpresa',
    descripcion: 'Premio especial a definir por los organizadores.',
    imagen: null,
    colorBorde: 'border-dorado/30',
    colorBg: 'from-dorado/10 to-naval/20',
    colorTexto: 'text-dorado/70',
    size: 'chico',
  },
  {
    puesto: 10,
    emoji: '🦁',
    nombre: 'Premio El León',
    descripcion: 'Premio especial del Club San Carlos. El Carcelero premia a quien más se esforzó.',
    imagen: '/assets/images/club-11.jpeg',
    colorBorde: 'border-dorado/50',
    colorBg: 'from-dorado/15 to-naval/20',
    colorTexto: 'text-dorado',
    size: 'mediano',
  },
] as const

export default async function PremiosPage() {
  const config = await getConfig()
  const precio = config.precio_inscripcion ?? '30000'
  const prodeAbierto = config.prode_abierto !== 'false'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/club-3.jpeg"
            alt="Club San Carlos"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-oscuro/70 via-naval/70 to-oscuro" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors mb-6">
            ← Volver al inicio
          </Link>

          <div className="flex justify-center mb-4">
            <Image
              src="/assets/logo/logo.jpg"
              alt="Club San Carlos"
              width={72}
              height={72}
              className="rounded-full border-4 border-dorado shadow-xl"
            />
          </div>

          <p className="text-dorado text-xs font-bold tracking-[0.3em] uppercase mb-2">Club San Carlos Rugby</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            🏆 PREMIOS
          </h1>
          <h2 className="text-xl font-black text-dorado mb-3">Prode Carcelero 2026</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Los premios se acreditan a los ganadores al finalizar el torneo.
            Inscripción: <strong className="text-dorado">${parseInt(precio).toLocaleString('es-AR')}</strong>
          </p>
        </div>
      </section>

      <RayasDecorativas />

      {/* Rayas decorativas azul/blanco */}
      <div className="h-1.5 w-full bg-gradient-to-r from-naval via-azul to-naval" />

      {/* Premios principales (podio) */}
      <section className="max-w-2xl mx-auto px-4 py-8 w-full space-y-4">
        <div className="text-center mb-8">
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Premios confirmados</span>
          <p className="text-white/30 text-xs mt-1">Los premios se definen y publican antes del inicio del torneo</p>
        </div>

        {/* 1° Puesto — destacado */}
        <PremioDestacado premio={PREMIOS_PLACEHOLDER[0]} />

        {/* 2° y 3° — en fila */}
        <div className="grid sm:grid-cols-2 gap-4">
          <PremioCard premio={PREMIOS_PLACEHOLDER[1]} />
          <PremioCard premio={PREMIOS_PLACEHOLDER[2]} />
        </div>

        <RayasHorizontales className="my-4" />

        {/* 4° a 9° — grid compacto */}
        <div>
          <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-4">Otros premios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PREMIOS_PLACEHOLDER.slice(3, 9).map(p => (
              <PremioChico key={p.puesto} premio={p} />
            ))}
          </div>
        </div>

        <RayasHorizontales className="my-4" />

        {/* Premio especial */}
        <PremioCard premio={PREMIOS_PLACEHOLDER[9]} />
      </section>

      {/* Banner rayas azul-blanco */}
      <div
        className="h-4 w-full"
        style={{ background: 'repeating-linear-gradient(90deg, #1B2E5E 0px, #1B2E5E 30px, #FFFFFF 30px, #FFFFFF 60px)' }}
      />

      {/* CTA */}
      <section className="bg-naval py-10 px-4 text-center">
        <div className="max-w-md mx-auto">
          <Image
            src="/assets/logo/logo.jpg"
            alt="Club San Carlos"
            width={56}
            height={56}
            className="rounded-full border-2 border-dorado mx-auto mb-4"
          />
          <p className="text-white/70 text-sm mb-2">
            ¿Querés ganar alguno de estos premios?
          </p>
          <p className="text-white/40 text-xs mb-5">
            Inscripción: <span className="text-dorado font-bold">${parseInt(precio).toLocaleString('es-AR')}</span> · Cierra el 11 de junio de 2026
          </p>
          {prodeAbierto ? (
            <Link href="/jugar" className="inline-block bg-dorado text-oscuro font-black px-8 py-4 rounded-xl text-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-dorado/20">
              ⚽ ¡Hacé tu prode!
            </Link>
          ) : (
            <p className="text-red-400 font-semibold">⛔ El prode está cerrado</p>
          )}
          <div className="mt-5">
            <Link href="/tabla" className="text-dorado/70 text-sm underline underline-offset-2 hover:text-dorado">
              Ver tabla de posiciones →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-azul/20 py-4 text-center">
        <p className="text-white/30 text-xs">Club San Carlos Rugby · Prode Carcelero 2026</p>
      </footer>
    </div>
  )
}

// ─── Componentes ─────────────────────────────────────────────────────────────

type PremioData = typeof PREMIOS_PLACEHOLDER[number]

function PremioDestacado({ premio }: { premio: PremioData }) {
  return (
    <div className={`relative bg-gradient-to-br ${premio.colorBg} border-2 ${premio.colorBorde} rounded-2xl overflow-hidden`}>
      {/* Imagen de fondo si existe */}
      {premio.imagen && (
        <div className="absolute inset-0">
          <Image src={premio.imagen} alt="" fill className="object-cover opacity-10" />
        </div>
      )}

      {/* Rayas decorativas arriba */}
      <div
        className="h-2 w-full"
        style={{ background: 'repeating-linear-gradient(90deg, #1B2E5E 0px, #1B2E5E 20px, #FFFFFF 20px, #FFFFFF 40px)' }}
      />

      <div className="relative z-10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl mb-1">{premio.emoji}</div>
            <div className={`text-xs font-black uppercase tracking-wider ${premio.colorTexto}`}>
              {premio.puesto}° Puesto
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-2xl font-black ${premio.colorTexto} mb-2`}>{premio.nombre}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{premio.descripcion}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-dorado/10 border border-dorado/30 text-dorado text-xs font-semibold px-3 py-1.5 rounded-lg">
              🔒 Premio a confirmar por los organizadores
            </div>
          </div>
        </div>

        {/* Imagen principal */}
        {premio.imagen && (
          <div className="mt-4 rounded-xl overflow-hidden h-40 relative">
            <Image src={premio.imagen} alt="Club San Carlos" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-oscuro/60 to-transparent" />
          </div>
        )}
      </div>

      {/* Rayas decorativas abajo */}
      <div
        className="h-2 w-full"
        style={{ background: 'repeating-linear-gradient(90deg, #1B2E5E 0px, #1B2E5E 20px, #FFFFFF 20px, #FFFFFF 40px)' }}
      />
    </div>
  )
}

function PremioCard({ premio }: { premio: PremioData }) {
  return (
    <div className={`bg-gradient-to-br ${premio.colorBg} border ${premio.colorBorde} rounded-xl overflow-hidden`}>
      {premio.imagen && (
        <div className="h-28 relative">
          <Image src={premio.imagen} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-naval/80 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <span className="text-2xl">{premio.emoji}</span>
            <span className={`text-xs font-black uppercase ${premio.colorTexto}`}>{premio.puesto}° Puesto</span>
          </div>
        </div>
      )}
      <div className="p-4">
        {!premio.imagen && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{premio.emoji}</span>
            <span className={`text-xs font-black uppercase ${premio.colorTexto}`}>{premio.puesto}° Puesto</span>
          </div>
        )}
        <h3 className={`font-black text-base ${premio.colorTexto} mb-1`}>{premio.nombre}</h3>
        <p className="text-white/50 text-xs leading-relaxed">{premio.descripcion}</p>
        <div className="mt-2 text-white/30 text-xs italic">Premio a confirmar</div>
      </div>
    </div>
  )
}

function PremioChico({ premio }: { premio: PremioData }) {
  return (
    <div className={`bg-gradient-to-br ${premio.colorBg} border ${premio.colorBorde} rounded-xl p-3 text-center`}>
      <div className="text-2xl mb-1">{premio.emoji}</div>
      <div className={`text-xs font-black uppercase ${premio.colorTexto} mb-1`}>{premio.puesto}° Puesto</div>
      <div className="text-white/60 text-xs font-semibold">{premio.nombre}</div>
      <div className="text-white/30 text-xs mt-1 italic">A confirmar</div>
    </div>
  )
}
