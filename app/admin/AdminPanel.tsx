'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Participante, Partido, Configuracion } from '@/lib/types'

export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false)
  const [password, setPassword] = useState('')
  const [errorLogin, setErrorLogin] = useState('')
  const [tab, setTab] = useState<'participantes' | 'partidos' | 'config' | 'bonus'>('participantes')

  const login = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'carcelero2026') {
      setAutenticado(true)
    } else {
      setErrorLogin('Contraseña incorrecta')
    }
  }

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
          <button onClick={login} className="w-full bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors">
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oscuro">
      <div className="bg-naval border-b border-azul/30 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-black text-dorado">Panel Admin</h1>
          <p className="text-white/50 text-xs">Prode Carcelero 2026</p>
        </div>
        <button onClick={() => setAutenticado(false)} className="text-white/40 text-sm hover:text-white">
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-naval/50 border-b border-azul/20 px-4">
        <div className="flex gap-1 overflow-x-auto">
          {(['participantes', 'partidos', 'bonus', 'config'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap ${
                tab === t ? 'border-dorado text-dorado' : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t === 'participantes' ? '👥 Participantes' :
               t === 'partidos' ? '⚽ Partidos' :
               t === 'bonus' ? '🎯 Bonus' : '⚙️ Config'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'participantes' && <TabParticipantes />}
        {tab === 'partidos' && <TabPartidos />}
        {tab === 'bonus' && <TabBonus />}
        {tab === 'config' && <TabConfig />}
      </div>
    </div>
  )
}

// ─── Tab Participantes ───────────────────────────────────────────────────────

function TabParticipantes() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

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
  }

  const exportarCSV = () => {
    const header = 'Código,Nombre,Apellido,WhatsApp,Pago,Fecha\n'
    const rows = participantes.map(p =>
      `${p.codigo},${p.nombre},${p.apellido},${p.whatsapp},${p.pago_confirmado ? 'Confirmado' : 'Pendiente'},${new Date(p.created_at).toLocaleDateString('es-AR')}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'participantes.csv'; a.click()
  }

  const filtrados = participantes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.codigo}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const confirmados = participantes.filter(p => p.pago_confirmado).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Participantes</h2>
          <p className="text-white/50 text-sm">{participantes.length} totales · {confirmados} pagos confirmados</p>
        </div>
        <button onClick={exportarCSV} className="bg-azul text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          📥 Exportar CSV
        </button>
      </div>

      <input
        type="text"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        placeholder="Buscar por nombre o código..."
        className="w-full bg-naval border border-azul/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-dorado placeholder:text-white/30 text-sm"
      />

      {loading ? (
        <div className="text-center py-8 text-white/40">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(p => (
            <div key={p.id} className="bg-naval rounded-xl border border-azul/20 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-dorado font-bold text-sm">{p.codigo}</span>
                  <span className="font-semibold text-white">{p.nombre} {p.apellido}</span>
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  {p.whatsapp} · {new Date(p.created_at).toLocaleDateString('es-AR')}
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
          ))}
          {filtrados.length === 0 && (
            <div className="text-center py-8 text-white/30">No hay resultados</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab Partidos ────────────────────────────────────────────────────────────

function TabPartidos() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<number | null>(null)
  const [resultados, setResultados] = useState<Record<number, { local: string; visitante: string }>>({})
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

    await supabase.from('partidos').update({
      goles_local_real: local,
      goles_visitante_real: visitante,
      jugado: true,
    }).eq('id', partido.id)

    setPartidos(prev => prev.map(p =>
      p.id === partido.id ? { ...p, goles_local_real: local, goles_visitante_real: visitante, jugado: true } : p
    ))
    setEditando(null)
  }

  const fases = ['grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final']
  const partidosFase = partidos.filter(p => p.fase === faseTab)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Cargar Resultados</h2>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {fases.map(f => (
          <button
            key={f}
            onClick={() => setFaseTab(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              faseTab === f ? 'bg-dorado text-oscuro' : 'bg-naval border border-azul/30 text-white/60'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/40">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {partidosFase.map(p => (
            <div key={p.id} className="bg-naval rounded-xl border border-azul/20 p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="text-sm">
                  {p.grupo && <span className="text-white/40 text-xs mr-2">Grupo {p.grupo}</span>}
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
                    placeholder="0"
                    value={resultados[p.id]?.local ?? ''}
                    onChange={e => setResultados(prev => ({ ...prev, [p.id]: { ...prev[p.id], local: e.target.value } }))}
                    className="w-14 bg-oscuro border border-dorado text-white text-center rounded-lg py-2 outline-none"
                  />
                  <span className="text-dorado font-bold">-</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={resultados[p.id]?.visitante ?? ''}
                    onChange={e => setResultados(prev => ({ ...prev, [p.id]: { ...prev[p.id], visitante: e.target.value } }))}
                    className="w-14 bg-oscuro border border-dorado text-white text-center rounded-lg py-2 outline-none"
                  />
                  <button onClick={() => guardarResultado(p)} className="bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">
                    Guardar
                  </button>
                  <button onClick={() => setEditando(null)} className="text-white/40 px-2 py-2 text-sm">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditando(p.id)
                    setResultados(prev => ({
                      ...prev,
                      [p.id]: { local: p.goles_local_real?.toString() ?? '', visitante: p.goles_visitante_real?.toString() ?? '' }
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

// ─── Tab Bonus ───────────────────────────────────────────────────────────────

function TabBonus() {
  const [values, setValues] = useState({ campeon: '', subcampeon: '', goleador: '', guante_oro: '', mejor_joven: '' })
  const [guardado, setGuardado] = useState(false)

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
    await supabase.from('resultados_bonus').update(values).eq('id', 1)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Resultados Bonus</h2>
      <p className="text-white/50 text-sm">Completá cuando se conozcan los ganadores reales del torneo</p>

      {[
        { key: 'campeon', label: 'Campeón del Mundial', emoji: '🏆' },
        { key: 'subcampeon', label: 'Subcampeón', emoji: '🥈' },
        { key: 'goleador', label: 'Goleador del torneo', emoji: '⚽' },
        { key: 'guante_oro', label: 'Guante de Oro', emoji: '🧤' },
        { key: 'mejor_joven', label: 'Mejor Jugador Joven', emoji: '⭐' },
      ].map(b => (
        <div key={b.key}>
          <label className="text-sm font-semibold text-white/70 mb-1.5 block">{b.emoji} {b.label}</label>
          <input
            type="text"
            value={values[b.key as keyof typeof values]}
            onChange={e => setValues(prev => ({ ...prev, [b.key]: e.target.value }))}
            placeholder="Pendiente"
            className="w-full bg-oscuro border border-azul/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-dorado placeholder:text-white/30"
          />
        </div>
      ))}

      <button onClick={guardar} className="w-full bg-dorado text-oscuro font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors">
        {guardado ? '✓ Guardado' : 'Guardar resultados bonus'}
      </button>
    </div>
  )
}

// ─── Tab Config ──────────────────────────────────────────────────────────────

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
    setTimeout(() => setGuardados(prev => { const s = new Set(Array.from(prev)); s.delete(item.clave); return s }), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Configuración</h2>

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
