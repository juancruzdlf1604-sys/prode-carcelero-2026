'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { calcularPuntosGrupo, calcularPuntosBonus } from '@/lib/puntos'
import type { Participante, Partido, Configuracion, Bonus, ResultadosBonus } from '@/lib/types'

type TabType = 'participantes' | 'partidos' | 'tabla' | 'bonus' | 'premios' | 'sync' | 'config'

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false)
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [tab, setTab] = useState<TabType>('participantes')
  const [stats, setStats] = useState({ total: 0, confirmados: 0, precio: 30000 })

  const login = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'carcelero2026') {
      setAutenticado(true)
    } else {
      setErrorLogin('Contraseña incorrecta')
    }
  }

  const cargarStats = useCallback(async () => {
    const [{ count: total }, { count: confirmados }, { data: config }] = await Promise.all([
      supabase.from('participantes').select('*', { count: 'exact', head: true }),
      supabase.from('participantes').select('*', { count: 'exact', head: true }).eq('pago_confirmado', true),
      supabase.from('configuracion').select('valor').eq('clave', 'precio_inscripcion').single(),
    ])
    setStats({
      total: total ?? 0,
      confirmados: confirmados ?? 0,
      precio: parseInt(config?.valor ?? '30000'),
    })
  }, [])

  useEffect(() => {
    if (autenticado) cargarStats()
  }, [autenticado, cargarStats])

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-oscuro px-4">
        <div className="bg-naval rounded-2xl p-8 w-full max-w-sm border border-azul/30">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-xl font-black text-white">Panel Admin</h1>
            <p className="text-white/50 text-sm">Prode Carcelero 2026</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Contraseña"
            className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado mb-3 placeholder:text-white/30"
          />
          {errorLogin && <p className="text-red-400 text-sm mb-3">{errorLogin}</p>}
          <button
            onClick={login}
            className="w-full bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  const target = new Date('2026-06-11T00:00:00-03:00')
  const diffMs = target.getTime() - Date.now()
  const diasRestantes = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  const TABS: { key: TabType; label: string }[] = [
    { key: 'participantes', label: '👥 Participantes' },
    { key: 'partidos', label: '⚽ Partidos' },
    { key: 'tabla', label: '🏆 Tabla' },
    { key: 'bonus', label: '🎯 Bonus' },
    { key: 'premios', label: '🎁 Premios' },
    { key: 'sync', label: '🔄 Sync' },
    { key: 'config', label: '⚙️ Config' },
  ]

  return (
    <div className="min-h-screen bg-oscuro">
      {/* Header */}
      <div className="bg-naval border-b border-azul/30 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-black text-dorado">Panel Admin</h1>
          <p className="text-white/50 text-xs">Prode Carcelero 2026</p>
        </div>
        <button onClick={() => setAutenticado(false)} className="text-white/40 text-sm hover:text-white transition-colors">
          Salir
        </button>
      </div>

      {/* Dashboard */}
      <div className="bg-naval/40 border-b border-azul/20 px-4 py-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Inscritos" value={stats.total} icon="👥" />
          <StatCard label="Confirmados" value={stats.confirmados} icon="✅" color="text-green-400" />
          <StatCard label="Pendientes" value={stats.total - stats.confirmados} icon="⏳" color="text-yellow-400" />
          <StatCard
            label="Recaudado"
            value={`$${(stats.confirmados * stats.precio).toLocaleString('es-AR')}`}
            icon="💰"
            color="text-dorado"
          />
        </div>
        <div className="max-w-4xl mx-auto mt-3 bg-azul/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-white/60 text-sm">⏱ Inicio del Mundial (11 jun 2026)</span>
          <span className={`font-black ${diasRestantes > 0 ? 'text-dorado' : 'text-green-400'}`}>
            {diasRestantes > 0 ? `${diasRestantes} días` : '¡Ya empezó!'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-naval/50 border-b border-azul/20 px-4">
        <div className="flex gap-0.5 overflow-x-auto max-w-4xl mx-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key ? 'border-dorado text-dorado' : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'participantes' && <TabParticipantes onStatsChange={cargarStats} />}
        {tab === 'partidos' && <TabPartidos />}
        {tab === 'tabla' && <TabTabla />}
        {tab === 'bonus' && <TabBonus />}
        {tab === 'premios' && <TabPremios />}
        {tab === 'sync' && <TabSync />}
        {tab === 'config' && <TabConfig />}
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color = 'text-white',
}: {
  label: string; value: string | number; icon: string; color?: string
}) {
  return (
    <div className="bg-naval rounded-xl border border-azul/20 px-3 py-3">
      <div className="text-white/40 text-xs mb-1">{icon} {label}</div>
      <div className={`font-black text-xl ${color}`}>{value}</div>
    </div>
  )
}

// ─── Tab Participantes ────────────────────────────────────────────────────────

function TabParticipantes({ onStatsChange }: { onStatsChange: () => void }) {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('participantes')
      .select('*')
      .order('created_at', { ascending: false })
    setParticipantes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const togglePago = async (id: string, actual: boolean) => {
    await supabase.from('participantes').update({ pago_confirmado: !actual }).eq('id', id)
    cargar()
    onStatsChange()
  }

  const eliminar = async (id: string) => {
    setEliminando(true)
    await supabase.from('participantes').delete().eq('id', id)
    setConfirmandoEliminar(null)
    setEliminando(false)
    cargar()
    onStatsChange()
  }

  const exportarCSV = () => {
    const header = 'Código,Nombre,Apellido,WhatsApp,Pago,Fecha\n'
    const rows = participantes.map(p =>
      `${p.codigo},${p.nombre},${p.apellido},${p.whatsapp},${p.pago_confirmado ? 'Confirmado' : 'Pendiente'},${new Date(p.created_at).toLocaleDateString('es-AR')}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'participantes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtrados = participantes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.codigo} ${p.whatsapp}`.toLowerCase().includes(filtro.toLowerCase())
  )
  const confirmados = participantes.filter(p => p.pago_confirmado).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Participantes</h2>
          <p className="text-white/50 text-sm">
            {participantes.length} totales · {confirmados} pagos confirmados
          </p>
        </div>
        <button
          onClick={exportarCSV}
          className="bg-azul text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          📥 Exportar CSV
        </button>
      </div>

      <input
        type="text"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        placeholder="Buscar por nombre, código o WhatsApp..."
        className="w-full bg-naval border border-azul/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-dorado placeholder:text-white/30 text-sm"
      />

      {loading ? (
        <div className="text-center py-8 text-white/40">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(p => {
            const waNum = p.whatsapp.replace(/\D/g, '')
            const waLink = `https://wa.me/${waNum.startsWith('54') ? waNum : '54' + waNum}`

            return (
              <div key={p.id} className="bg-naval rounded-xl border border-azul/20 p-4">
                {/* Fila superior: código + nombre + toggle pago */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-dorado font-bold text-sm">{p.codigo}</span>
                      <span className="font-semibold text-white">{p.nombre} {p.apellido}</span>
                    </div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePago(p.id, p.pago_confirmado)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      p.pago_confirmado
                        ? 'bg-green-900/50 text-green-400 border border-green-700/50 hover:bg-red-900/50 hover:text-red-400 hover:border-red-700/50'
                        : 'bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-green-900/50 hover:text-green-400 hover:border-green-700/50'
                    }`}
                  >
                    {p.pago_confirmado ? '✓ Pagado' : '✗ Pendiente'}
                  </button>
                </div>

                {/* Fila inferior: WA + ver prode + eliminar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 text-xs font-semibold hover:text-green-300 bg-green-900/20 px-2.5 py-1 rounded-lg border border-green-700/30 transition-colors"
                  >
                    📱 {p.whatsapp}
                  </a>
                  <Link
                    href={`/mi-prode/${p.codigo}`}
                    target="_blank"
                    className="text-azul text-xs font-semibold hover:text-blue-400 bg-azul/10 px-2.5 py-1 rounded-lg border border-azul/30 transition-colors"
                  >
                    👁 Ver prode
                  </Link>
                  {confirmandoEliminar === p.id ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-red-400 text-xs">¿Eliminar?</span>
                      <button
                        onClick={() => eliminar(p.id)}
                        disabled={eliminando}
                        className="bg-red-700 text-white text-xs px-2.5 py-1 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmandoEliminar(null)}
                        className="bg-naval border border-azul/30 text-white/50 text-xs px-2.5 py-1 rounded-lg hover:text-white"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoEliminar(p.id)}
                      className="ml-auto text-red-400/40 hover:text-red-400 text-xs px-2 py-1 rounded-lg border border-red-700/20 hover:border-red-700/50 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtrados.length === 0 && (
            <div className="text-center py-8 text-white/30">No hay resultados</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab Partidos ─────────────────────────────────────────────────────────────

function TabPartidos() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<number | null>(null)
  const [resultados, setResultados] = useState<Record<number, { local: string; visitante: string }>>({})
  const [guardando, setGuardando] = useState<number | null>(null)
  const [faseTab, setFaseTab] = useState('grupos')

  useEffect(() => {
    supabase.from('partidos').select('*').order('fase').order('grupo').order('ronda')
      .then(({ data }) => {
        setPartidos(data || [])
        setLoading(false)
      })
  }, [])

  const guardarResultado = async (partido: Partido) => {
    const r = resultados[partido.id]
    if (!r) return
    const local = parseInt(r.local)
    const visitante = parseInt(r.visitante)
    if (isNaN(local) || isNaN(visitante)) return

    setGuardando(partido.id)
    await supabase.from('partidos').update({
      goles_local_real: local,
      goles_visitante_real: visitante,
      jugado: true,
    }).eq('id', partido.id)

    setPartidos(prev => prev.map(p =>
      p.id === partido.id
        ? { ...p, goles_local_real: local, goles_visitante_real: visitante, jugado: true }
        : p
    ))
    setEditando(null)
    setGuardando(null)
  }

  const fases = ['grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final']
  const jugados = partidos.filter(p => p.jugado).length
  const partidosFase = partidos.filter(p => p.fase === faseTab)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Cargar Resultados</h2>
        <p className="text-white/50 text-sm">{jugados} de {partidos.length} partidos cargados</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {fases.map(f => {
          const total = partidos.filter(p => p.fase === f).length
          const jugadosFase = partidos.filter(p => p.fase === f && p.jugado).length
          return (
            <button
              key={f}
              onClick={() => setFaseTab(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                faseTab === f ? 'bg-dorado text-oscuro' : 'bg-naval border border-azul/30 text-white/60 hover:text-white'
              }`}
            >
              {f} {total > 0 && <span className="opacity-70">({jugadosFase}/{total})</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {partidosFase.map(p => (
            <div key={p.id} className="bg-naval rounded-xl border border-azul/20 p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="text-sm">
                  {p.grupo && <span className="text-white/40 text-xs mr-2">Grupo {p.grupo} ·</span>}
                  <span className="font-semibold text-white">{p.equipo_local} vs {p.equipo_visitante}</span>
                </div>
                {p.jugado && (
                  <span className="text-green-400 text-xs font-semibold bg-green-900/30 px-2 py-0.5 rounded">
                    ✓ {p.goles_local_real}-{p.goles_visitante_real}
                  </span>
                )}
              </div>

              {editando === p.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="0"
                    value={resultados[p.id]?.local ?? ''}
                    onChange={e => setResultados(prev => ({ ...prev, [p.id]: { ...prev[p.id], local: e.target.value } }))}
                    className="w-14 bg-oscuro border border-dorado text-white text-center rounded-lg py-2 outline-none"
                  />
                  <span className="text-dorado font-bold">-</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="0"
                    value={resultados[p.id]?.visitante ?? ''}
                    onChange={e => setResultados(prev => ({ ...prev, [p.id]: { ...prev[p.id], visitante: e.target.value } }))}
                    className="w-14 bg-oscuro border border-dorado text-white text-center rounded-lg py-2 outline-none"
                  />
                  <button
                    onClick={() => guardarResultado(p)}
                    disabled={guardando === p.id}
                    className="bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                  >
                    {guardando === p.id ? '...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(null)} className="text-white/40 px-2 py-2 text-sm hover:text-white">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditando(p.id)
                    setResultados(prev => ({
                      ...prev,
                      [p.id]: {
                        local: p.goles_local_real?.toString() ?? '',
                        visitante: p.goles_visitante_real?.toString() ?? '',
                      },
                    }))
                  }}
                  className="text-xs text-azul hover:text-dorado transition-colors font-semibold mt-1"
                >
                  {p.jugado ? '✏️ Editar resultado' : '+ Cargar resultado'}
                </button>
              )}
            </div>
          ))}
          {partidosFase.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              Los partidos de esta fase aparecerán cuando se generen
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab Tabla ────────────────────────────────────────────────────────────────

interface EntradaAdminTabla {
  codigo: string
  nombre: string
  apellido: string
  pago_confirmado: boolean
  puntos: number
  exactos: number
  pts_grupos: number
  pts_bonus: number
}

function TabTabla() {
  const [tabla, setTabla] = useState<EntradaAdminTabla[]>([])
  const [loading, setLoading] = useState(true)
  const [soloPagados, setSoloPagados] = useState(false)

  const calcular = useCallback(async () => {
    setLoading(true)
    const [
      { data: participantes },
      { data: pronosticosGrupos },
      { data: partidos },
      { data: bonuses },
      { data: resultBonus },
    ] = await Promise.all([
      supabase.from('participantes').select('id, codigo, nombre, apellido, pago_confirmado'),
      supabase.from('pronosticos_grupos').select('participante_id, partido_id, goles_local, goles_visitante'),
      supabase.from('partidos').select('id, goles_local_real, goles_visitante_real, jugado').eq('jugado', true),
      supabase.from('bonus').select('*'),
      supabase.from('resultados_bonus').select('*').eq('id', 1).single(),
    ])

    if (!participantes) { setLoading(false); return }

    const partidosMap = new Map((partidos || []).map(p => [p.id, p]))

    const pronMap = new Map<string, Array<{ partido_id: number; goles_local: number; goles_visitante: number }>>()
    pronosticosGrupos?.forEach(pg => {
      const arr = pronMap.get(pg.participante_id) ?? []
      arr.push(pg)
      pronMap.set(pg.participante_id, arr)
    })

    const bonusMap = new Map<string, Bonus>()
    bonuses?.forEach(b => bonusMap.set(b.participante_id, b))

    const rb = resultBonus as ResultadosBonus | null

    const nuevaTabla: EntradaAdminTabla[] = participantes.map(p => {
      let pts_grupos = 0
      let exactos = 0

      const prons = pronMap.get(p.id) ?? []
      prons.forEach(pg => {
        const partido = partidosMap.get(pg.partido_id)
        if (!partido) return
        const pts = calcularPuntosGrupo(
          { goles_local: pg.goles_local, goles_visitante: pg.goles_visitante },
          { goles_local_real: partido.goles_local_real, goles_visitante_real: partido.goles_visitante_real }
        )
        pts_grupos += pts
        if (pts === 10) exactos++
      })

      const bonus = bonusMap.get(p.id)
      const pts_bonus = bonus && rb ? calcularPuntosBonus(bonus, rb) : 0

      return {
        codigo: p.codigo,
        nombre: p.nombre,
        apellido: p.apellido,
        pago_confirmado: p.pago_confirmado,
        puntos: pts_grupos + pts_bonus,
        exactos,
        pts_grupos,
        pts_bonus,
      }
    })

    nuevaTabla.sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos)
    setTabla(nuevaTabla)
    setLoading(false)
  }, [])

  useEffect(() => { calcular() }, [calcular])

  const visibles = soloPagados ? tabla.filter(e => e.pago_confirmado) : tabla

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Tabla de Posiciones</h2>
          <p className="text-white/50 text-sm">{tabla.length} participantes</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-white/50 text-xs flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={soloPagados}
              onChange={e => setSoloPagados(e.target.checked)}
              className="accent-dorado"
            />
            Solo pagados
          </label>
          <button
            onClick={calcular}
            className="bg-azul text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Calculando...</div>
      ) : (
        <div className="space-y-1.5">
          {visibles.map((e, i) => (
            <div
              key={e.codigo}
              className={`bg-naval rounded-xl border p-3 flex items-center gap-3 ${
                i < 3 ? 'border-dorado/20' : 'border-azul/20'
              }`}
            >
              <div className={`text-sm font-black w-8 text-center flex-shrink-0 ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-white/30'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/mi-prode/${e.codigo}`} target="_blank" className="font-bold text-white text-sm hover:text-dorado transition-colors">
                    {e.nombre} {e.apellido}
                  </Link>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                    e.pago_confirmado
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {e.pago_confirmado ? '✓ Pagado' : '⏳'}
                  </span>
                </div>
                <div className="text-xs text-white/40 mt-0.5 flex flex-wrap gap-x-2">
                  <span>{e.codigo}</span>
                  <span>·</span>
                  <span>{e.exactos} exactos</span>
                  <span>·</span>
                  <span>Grupos: {e.pts_grupos} · Bonus: {e.pts_bonus}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-dorado font-black text-lg">{e.puntos}</div>
                <div className="text-white/30 text-xs">pts</div>
              </div>
            </div>
          ))}
          {visibles.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">No hay participantes</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab Bonus ────────────────────────────────────────────────────────────────

function TabBonus() {
  const [values, setValues] = useState({
    campeon: '', subcampeon: '', goleador: '', guante_oro: '', mejor_joven: '',
  })
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    supabase.from('resultados_bonus').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setValues({
          campeon: data.campeon || '',
          subcampeon: data.subcampeon || '',
          goleador: data.goleador || '',
          guante_oro: data.guante_oro || '',
          mejor_joven: data.mejor_joven || '',
        })
      })
  }, [])

  const guardar = async () => {
    setGuardando(true)
    await supabase.from('resultados_bonus').update(values).eq('id', 1)
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const CAMPOS = [
    { key: 'campeon', label: 'Campeón del Mundial', emoji: '🏆', placeholder: 'Ej: Argentina' },
    { key: 'subcampeon', label: 'Subcampeón', emoji: '🥈', placeholder: 'Ej: Francia' },
    { key: 'goleador', label: 'Goleador del torneo', emoji: '⚽', placeholder: 'Ej: Cristiano Ronaldo' },
    { key: 'guante_oro', label: 'Guante de Oro', emoji: '🧤', placeholder: 'Ej: Emiliano Martínez' },
    { key: 'mejor_joven', label: 'Mejor Jugador Joven', emoji: '⭐', placeholder: 'Ej: Lamine Yamal' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Resultados Bonus</h2>
        <p className="text-white/50 text-sm">Completá cuando se conozcan los ganadores reales del torneo. Los puntos se calculan automáticamente.</p>
      </div>

      {CAMPOS.map(b => (
        <div key={b.key}>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">{b.emoji} {b.label}</label>
          <input
            type="text"
            value={values[b.key as keyof typeof values]}
            onChange={e => setValues(prev => ({ ...prev, [b.key]: e.target.value }))}
            placeholder={b.placeholder}
            className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado placeholder:text-white/30"
          />
        </div>
      ))}

      <button
        onClick={guardar}
        disabled={guardando}
        className={`w-full font-black py-3 rounded-xl transition-colors ${
          guardado
            ? 'bg-green-700 text-white'
            : 'bg-dorado text-oscuro hover:bg-yellow-400 disabled:opacity-60'
        }`}
      >
        {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar resultados bonus'}
      </button>
    </div>
  )
}

// ─── Tab Premios ──────────────────────────────────────────────────────────────

interface Premio {
  puesto: number
  nombre: string
  descripcion: string
}

function TabPremios() {
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)
  const [guardandos, setGuardandos] = useState<Set<number>>(new Set())

  useEffect(() => {
    supabase.from('premios').select('puesto, nombre, descripcion').order('puesto')
      .then(({ data }) => {
        setPremios(data || [])
        setLoading(false)
      })
  }, [])

  const update = (puesto: number, campo: 'nombre' | 'descripcion', valor: string) => {
    setPremios(prev => prev.map(p => p.puesto === puesto ? { ...p, [campo]: valor } : p))
  }

  const guardar = async (puesto: number) => {
    const premio = premios.find(p => p.puesto === puesto)
    if (!premio) return
    await supabase.from('premios')
      .update({ nombre: premio.nombre, descripcion: premio.descripcion })
      .eq('puesto', puesto)
    setGuardandos(prev => new Set(Array.from(prev).concat(puesto)))
    setTimeout(() => setGuardandos(prev => {
      const s = new Set(Array.from(prev))
      s.delete(puesto)
      return s
    }), 2000)
  }

  const EMOJIS = ['🥇', '🥈', '🥉', '🎖️', '🎖️', '🎖️', '⭐', '⭐', '⭐', '🦁']

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Gestión de Premios</h2>
        <p className="text-white/50 text-sm">Los cambios se reflejan automáticamente en la página /premios</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Cargando...</div>
      ) : premios.length === 0 ? (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 text-sm text-yellow-300">
          <p className="font-semibold mb-1">⚠️ Tabla de premios no encontrada</p>
          <p className="text-yellow-300/70">Ejecutá el schema.sql actualizado en Supabase para crear la tabla premios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {premios.map((p, idx) => (
            <div key={p.puesto} className="bg-naval rounded-xl border border-azul/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{EMOJIS[idx] ?? '🎁'}</span>
                <span className="text-dorado font-black text-sm">{p.puesto}° Puesto</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Nombre del premio</label>
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={e => update(p.puesto, 'nombre', e.target.value)}
                    className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-dorado text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Descripción</label>
                  <textarea
                    value={p.descripcion}
                    onChange={e => update(p.puesto, 'descripcion', e.target.value)}
                    rows={2}
                    className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-dorado text-sm resize-none"
                  />
                </div>
              </div>
              <button
                onClick={() => guardar(p.puesto)}
                className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                  guardandos.has(p.puesto)
                    ? 'bg-green-700 text-white'
                    : 'bg-azul text-white hover:bg-blue-600'
                }`}
              >
                {guardandos.has(p.puesto) ? '✓ Guardado' : 'Guardar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab Sync ─────────────────────────────────────────────────────────────────

interface SyncResumen {
  actualizados: Array<{ id: number; partido: string; resultado: string }>
  errores: string[]
  sinCambios: number
  totalPartidosAPI?: number
  finalizadosAPI?: number
}

function TabSync() {
  const [sincronizando, setSincronizando] = useState(false)
  const [ultimaSync, setUltimaSync] = useState<string>('')
  const [resumen, setResumen] = useState<SyncResumen | null>(null)
  const [errorSync, setErrorSync] = useState('')

  const cargarEstado = useCallback(async () => {
    const { data } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['ultima_sincronizacion', 'ultima_sync_resumen'])

    data?.forEach(r => {
      if (r.clave === 'ultima_sincronizacion') setUltimaSync(r.valor)
      if (r.clave === 'ultima_sync_resumen' && r.valor) {
        try { setResumen(JSON.parse(r.valor)) } catch {}
      }
    })
  }, [])

  useEffect(() => { cargarEstado() }, [cargarEstado])

  const sincronizar = async () => {
    setSincronizando(true)
    setErrorSync('')
    try {
      const res = await fetch('/api/sync-resultados', {
        headers: { 'x-admin-password': 'carcelero2026' },
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorSync(json.error || `Error ${res.status}`)
      } else {
        setResumen({
          actualizados: json.actualizados,
          errores: json.errores,
          sinCambios: json.sinCambios,
          totalPartidosAPI: json.totalPartidosAPI,
          finalizadosAPI: json.finalizadosAPI,
        })
        setUltimaSync(json.timestamp)
      }
    } catch (e) {
      setErrorSync(e instanceof Error ? e.message : 'Error de red')
    }
    setSincronizando(false)
  }

  const tiempoDesde = (iso: string) => {
    if (!iso) return null
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'hace menos de un minuto'
    if (mins < 60) return `hace ${mins} minuto${mins !== 1 ? 's' : ''}`
    const hrs = Math.floor(mins / 60)
    return `hace ${hrs} hora${hrs !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Sincronización de Resultados</h2>
        <p className="text-white/50 text-sm">
          Actualiza los resultados desde football-data.org. Se ejecuta automáticamente cada 30 minutos.
        </p>
      </div>

      {/* Estado */}
      <div className="bg-naval rounded-xl border border-azul/20 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-white/40 text-xs mb-0.5">Última sincronización</div>
          <div className="text-white font-semibold text-sm">
            {ultimaSync ? tiempoDesde(ultimaSync) : 'Nunca'}
          </div>
          {ultimaSync && (
            <div className="text-white/30 text-xs">
              {new Date(ultimaSync).toLocaleString('es-AR')}
            </div>
          )}
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="bg-dorado text-oscuro font-black px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-wait text-sm"
        >
          {sincronizando ? '⏳ Sincronizando...' : '🔄 Sincronizar ahora'}
        </button>
      </div>

      {errorSync && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl px-4 py-3 text-red-300 text-sm">
          {errorSync}
        </div>
      )}

      {/* Resumen última sync */}
      {resumen && (
        <div className="space-y-3">
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-naval rounded-xl border border-azul/20 p-3 text-center">
              <div className="text-green-400 font-black text-xl">{resumen.actualizados.length}</div>
              <div className="text-white/40 text-xs">Actualizados</div>
            </div>
            <div className="bg-naval rounded-xl border border-azul/20 p-3 text-center">
              <div className="text-white/60 font-black text-xl">{resumen.sinCambios}</div>
              <div className="text-white/40 text-xs">Sin cambios</div>
            </div>
            <div className="bg-naval rounded-xl border border-azul/20 p-3 text-center">
              <div className={`font-black text-xl ${resumen.errores.length > 0 ? 'text-red-400' : 'text-white/30'}`}>
                {resumen.errores.length}
              </div>
              <div className="text-white/40 text-xs">Errores</div>
            </div>
          </div>

          {/* Partidos actualizados */}
          {resumen.actualizados.length > 0 && (
            <div>
              <h3 className="text-dorado text-xs font-bold uppercase tracking-wider mb-2">
                Partidos actualizados
              </h3>
              <div className="space-y-1.5">
                {resumen.actualizados.map(a => (
                  <div key={a.id} className="bg-naval rounded-lg border border-green-800/30 px-3 py-2 flex items-center justify-between text-sm">
                    <span className="text-white/80">{a.partido}</span>
                    <span className="text-green-400 font-black ml-3">{a.resultado}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errores */}
          {resumen.errores.length > 0 && (
            <div>
              <h3 className="text-red-400/70 text-xs font-bold uppercase tracking-wider mb-2">
                Errores de mapeo
              </h3>
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2 space-y-1">
                {resumen.errores.map((e, i) => (
                  <div key={i} className="text-red-300/70 text-xs">{e}</div>
                ))}
              </div>
            </div>
          )}

          {resumen.actualizados.length === 0 && resumen.errores.length === 0 && (
            <div className="text-center py-4 text-white/30 text-sm">
              Todo actualizado · No hay cambios nuevos
            </div>
          )}
        </div>
      )}

      {/* Nota sobre cron */}
      <div className="bg-azul/10 border border-azul/30 rounded-xl px-4 py-3 text-xs text-white/50 space-y-1">
        <p className="font-semibold text-white/70">ℹ️ Sincronización automática</p>
        <p>Configurada en <code className="text-dorado/70">vercel.json</code> para ejecutarse cada 30 minutos.</p>
        <p>Requiere plan Pro de Vercel para crons más frecuentes que diarios.</p>
        <p>La API <code className="text-dorado/70">football-data.org</code> tiene límite de 10 req/min en el plan gratuito.</p>
      </div>
    </div>
  )
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

function TabConfig() {
  const [config, setConfig] = useState<Configuracion[]>([])
  const [guardados, setGuardados] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase.from('configuracion').select('*').order('clave')
      .then(({ data }) => setConfig(data || []))
  }, [])

  const updateConfig = (clave: string, valor: string) => {
    setConfig(prev => prev.map(c => c.clave === clave ? { ...c, valor } : c))
  }

  const guardarItem = async (item: Configuracion) => {
    await supabase.from('configuracion').update({ valor: item.valor }).eq('clave', item.clave)
    setGuardados(prev => new Set(Array.from(prev).concat(item.clave)))
    setTimeout(() => setGuardados(prev => {
      const s = new Set(Array.from(prev))
      s.delete(item.clave)
      return s
    }), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Configuración</h2>
        <p className="text-white/50 text-sm">Precio de inscripción, alias de pago, WhatsApp del organizador, etc.</p>
      </div>

      {config.map(item => (
        <div key={item.clave} className="bg-naval rounded-xl border border-azul/20 p-4">
          <label className="text-dorado text-xs font-bold uppercase tracking-wider mb-1 block">
            {item.clave.replace(/_/g, ' ')}
          </label>
          {item.descripcion && (
            <p className="text-white/40 text-xs mb-2">{item.descripcion}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={item.valor}
              onChange={e => updateConfig(item.clave, e.target.value)}
              className="flex-1 bg-oscuro border border-azul/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-dorado text-sm"
            />
            <button
              onClick={() => guardarItem(item)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                guardados.has(item.clave) ? 'bg-green-700 text-white' : 'bg-azul text-white hover:bg-blue-600'
              }`}
            >
              {guardados.has(item.clave) ? '✓' : 'Guardar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
