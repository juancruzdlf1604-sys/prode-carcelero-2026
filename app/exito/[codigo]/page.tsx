import { supabaseAdmin as supabase } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface Props {
  params: { codigo: string }
}

export default async function ExitoPage({ params }: Props) {
  const codigo = params.codigo.toUpperCase()

  const [{ data: participante }, { data: configRows }] = await Promise.all([
    supabase
      .from('participantes')
      .select('nombre, apellido, codigo')
      .eq('codigo', codigo)
      .single(),
    supabase.from('configuracion').select('clave, valor'),
  ])

  if (!participante) notFound()

  const config: Record<string, string> = {}
  configRows?.forEach(r => { config[r.clave] = r.valor })

  const precio = config.precio_inscripcion ?? '30000'
  const alias = config.alias_pago ?? ''
  const cbu = config.cbu_pago ?? ''
  const waAdmin = (config.whatsapp_admin ?? '').replace(/\D/g, '')
  const baseUrl = config.base_url ?? 'https://prode-app-two.vercel.app'

  const linkPersonal = `${baseUrl}/mi-prode/${participante.codigo}`
  const precioFormateado = `$${parseInt(precio).toLocaleString('es-AR')}`

  const mensajeWa = encodeURIComponent(
    `Hola! Completé el Prode Carcelero 2026. Mi código es ${participante.codigo}. Te mando el comprobante de transferencia de ${precioFormateado}.`
  )
  const waUrl = waAdmin ? `https://wa.me/${waAdmin}?text=${mensajeWa}` : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 max-w-lg mx-auto w-full">

        {/* Check animado */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white text-center">¡Tu prode fue enviado con éxito!</h1>
          <p className="text-white/50 text-sm text-center mt-1">
            {participante.nombre} {participante.apellido}
          </p>
        </div>

        {/* Código destacado */}
        <div className="w-full bg-naval rounded-2xl border border-azul/30 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-dorado/20 to-dorado/5 px-6 py-5 text-center">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Tu código único</p>
            <div className="text-5xl font-black text-dorado tracking-widest">{participante.codigo}</div>
            <p className="text-white/40 text-xs mt-2">Guardalo — lo vas a necesitar para ver tu prode</p>
          </div>
          <div className="px-6 py-4 border-t border-azul/20">
            <p className="text-white/40 text-xs mb-1.5 text-center">Tu link personal</p>
            <div className="bg-oscuro/50 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
              <span className="text-dorado/80 text-xs font-mono truncate">{linkPersonal}</span>
              <Link
                href={`/mi-prode/${participante.codigo}`}
                className="flex-shrink-0 bg-azul text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ver →
              </Link>
            </div>
          </div>
        </div>

        {/* Instrucciones de pago */}
        <div className="w-full bg-naval rounded-2xl border border-azul/30 p-5 mb-4">
          <h2 className="text-dorado font-bold text-sm uppercase tracking-wider mb-3">💳 Confirmá tu participación</h2>
          <p className="text-white/70 text-sm mb-4">
            Para quedar inscripto oficialmente, transferí{' '}
            <strong className="text-dorado">{precioFormateado}</strong> a:
          </p>
          <div className="space-y-2.5">
            {alias && (
              <div className="bg-oscuro/50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-white/40 text-xs">Alias</span>
                <span className="text-white font-bold text-sm font-mono">{alias}</span>
              </div>
            )}
            {cbu && (
              <div className="bg-oscuro/50 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-white/40 text-xs flex-shrink-0">CBU</span>
                <span className="text-white font-bold text-xs font-mono text-right break-all">{cbu}</span>
              </div>
            )}
            {!alias && !cbu && (
              <p className="text-white/30 text-sm text-center italic">Datos de pago a confirmar por el organizador</p>
            )}
          </div>
        </div>

        {/* Botón WhatsApp */}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 active:scale-95 transition-all text-white font-black py-4 rounded-2xl text-base shadow-lg shadow-green-900/30 mb-4"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar comprobante por WhatsApp
          </a>
        ) : (
          <div className="w-full bg-green-900/20 border border-green-700/30 rounded-2xl px-5 py-4 text-center mb-4">
            <p className="text-green-300/70 text-sm">Mandá el comprobante de transferencia al organizador por WhatsApp.</p>
          </div>
        )}

        {/* Links secundarios */}
        <div className="flex flex-col items-center gap-3 w-full">
          <Link
            href={`/mi-prode/${participante.codigo}`}
            className="w-full text-center border border-azul/40 text-white/70 font-semibold py-3 rounded-xl hover:bg-azul/10 transition-colors text-sm"
          >
            Ver mi prode completo →
          </Link>
          <Link href="/tabla" className="text-dorado/70 text-sm underline underline-offset-2 hover:text-dorado">
            Ver tabla de posiciones
          </Link>
        </div>

        {/* Logo */}
        <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
          <Image src="/assets/logo/logo.jpg" alt="Club San Carlos" width={36} height={36} className="rounded-full" />
          <p className="text-white/40 text-xs">Club San Carlos Rugby · Prode Carcelero 2026</p>
        </div>

      </div>
    </div>
  )
}
