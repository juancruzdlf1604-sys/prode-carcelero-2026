import type { Bonus, ResultadosBonus } from './types'

export function normalizarString(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// Partial match: "Yamal" coincides with "Lamine Yamal" and vice versa
export function coincideBonus(a: string, b: string): boolean {
  if (!a || !b) return false
  const na = normalizarString(a)
  const nb = normalizarString(b)
  return na === nb || na.includes(nb) || nb.includes(na)
}

export function calcularPuntosGrupo(
  pronostico: { goles_local: number; goles_visitante: number },
  real: { goles_local_real: number; goles_visitante_real: number }
): number {
  if (pronostico.goles_local === real.goles_local_real && pronostico.goles_visitante === real.goles_visitante_real) {
    return 10
  }
  const ganadorPron = Math.sign(pronostico.goles_local - pronostico.goles_visitante)
  const ganadorReal = Math.sign(real.goles_local_real - real.goles_visitante_real)
  if (ganadorPron === ganadorReal) return 5
  return 0
}

export function calcularPuntosEliminatoria(
  pronostico: { equipo_local: string; equipo_visitante: string; goles_local?: number; goles_visitante?: number },
  real: { equipo_local: string; equipo_visitante: string; goles_local_real?: number; goles_visitante_real?: number }
): number {
  let puntos = 0
  const acertoEquipos =
    (pronostico.equipo_local === real.equipo_local && pronostico.equipo_visitante === real.equipo_visitante) ||
    (pronostico.equipo_local === real.equipo_visitante && pronostico.equipo_visitante === real.equipo_local)

  if (!acertoEquipos) return 0
  puntos += 10

  if (pronostico.goles_local == null || pronostico.goles_visitante == null) return puntos
  if (real.goles_local_real == null || real.goles_visitante_real == null) return puntos

  const ganadorPron = Math.sign(pronostico.goles_local - pronostico.goles_visitante)
  const ganadorReal = Math.sign(real.goles_local_real - real.goles_visitante_real)
  if (ganadorPron === ganadorReal && ganadorPron !== 0) {
    puntos += 10
    if (pronostico.goles_local === real.goles_local_real && pronostico.goles_visitante === real.goles_visitante_real) {
      puntos += 20
    }
  }
  return puntos
}

export function calcularPuntosBonus(bonus: Bonus, resultados: ResultadosBonus): number {
  let puntos = 0
  if (resultados.campeon && coincideBonus(bonus.campeon, resultados.campeon)) puntos += 100
  if (resultados.subcampeon && coincideBonus(bonus.subcampeon, resultados.subcampeon)) puntos += 50
  if (resultados.goleador && coincideBonus(bonus.goleador, resultados.goleador)) puntos += 50
  if (resultados.guante_oro && coincideBonus(bonus.guante_oro, resultados.guante_oro)) puntos += 50
  if (resultados.mejor_joven && coincideBonus(bonus.mejor_joven, resultados.mejor_joven)) puntos += 50
  if (resultados.mejor_jugador && coincideBonus(bonus.mejor_jugador ?? '', resultados.mejor_jugador)) puntos += 50
  return puntos
}
