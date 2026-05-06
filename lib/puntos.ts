import type { Bonus, ResultadosBonus } from './types'

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
  if (resultados.campeon && bonus.campeon === resultados.campeon) puntos += 100
  if (resultados.subcampeon && bonus.subcampeon === resultados.subcampeon) puntos += 50
  if (resultados.goleador && bonus.goleador === resultados.goleador) puntos += 50
  if (resultados.guante_oro && bonus.guante_oro === resultados.guante_oro) puntos += 50
  if (resultados.mejor_joven && bonus.mejor_joven === resultados.mejor_joven) puntos += 50
  return puntos
}
