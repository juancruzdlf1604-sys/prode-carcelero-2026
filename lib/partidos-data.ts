export interface PartidoLocal {
  id: number
  grupo: string
  ronda: number
  equipo_local: string
  equipo_visitante: string
  fecha: string
}

export interface ClasificacionGrupo {
  equipo: string
  pts: number
  pj: number
  gf: number
  gc: number
  gd: number
}

export const GRUPOS_DATA: Record<string, string[]> = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'Chequia'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Noruega', 'Irak'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'Uzbekistán', 'Colombia', 'RD Congo'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

// 72 matches — round robin within each group
// For each group [T1, T2, T3, T4]:
// MD1: T1 vs T2, T3 vs T4
// MD2: T1 vs T3, T2 vs T4
// MD3: T1 vs T4, T2 vs T3
export const PARTIDOS_GRUPOS: PartidoLocal[] = [
  // Grupo A
  { id: 1,  grupo: 'A', ronda: 1, equipo_local: 'México',       equipo_visitante: 'Sudáfrica',   fecha: '2026-06-11' },
  { id: 2,  grupo: 'A', ronda: 1, equipo_local: 'Corea del Sur', equipo_visitante: 'Chequia',     fecha: '2026-06-11' },
  { id: 3,  grupo: 'A', ronda: 2, equipo_local: 'México',       equipo_visitante: 'Corea del Sur', fecha: '2026-06-17' },
  { id: 4,  grupo: 'A', ronda: 2, equipo_local: 'Sudáfrica',    equipo_visitante: 'Chequia',     fecha: '2026-06-17' },
  { id: 5,  grupo: 'A', ronda: 3, equipo_local: 'México',       equipo_visitante: 'Chequia',     fecha: '2026-06-26' },
  { id: 6,  grupo: 'A', ronda: 3, equipo_local: 'Corea del Sur', equipo_visitante: 'Sudáfrica',  fecha: '2026-06-26' },

  // Grupo B
  { id: 7,  grupo: 'B', ronda: 1, equipo_local: 'Canadá',       equipo_visitante: 'Bosnia y Herzegovina', fecha: '2026-06-12' },
  { id: 8,  grupo: 'B', ronda: 1, equipo_local: 'Catar',        equipo_visitante: 'Suiza',       fecha: '2026-06-12' },
  { id: 9,  grupo: 'B', ronda: 2, equipo_local: 'Canadá',       equipo_visitante: 'Catar',       fecha: '2026-06-18' },
  { id: 10, grupo: 'B', ronda: 2, equipo_local: 'Bosnia y Herzegovina', equipo_visitante: 'Suiza', fecha: '2026-06-18' },
  { id: 11, grupo: 'B', ronda: 3, equipo_local: 'Canadá',       equipo_visitante: 'Suiza',       fecha: '2026-06-27' },
  { id: 12, grupo: 'B', ronda: 3, equipo_local: 'Catar',        equipo_visitante: 'Bosnia y Herzegovina', fecha: '2026-06-27' },

  // Grupo C
  { id: 13, grupo: 'C', ronda: 1, equipo_local: 'Brasil',       equipo_visitante: 'Marruecos',   fecha: '2026-06-13' },
  { id: 14, grupo: 'C', ronda: 1, equipo_local: 'Haití',        equipo_visitante: 'Escocia',     fecha: '2026-06-13' },
  { id: 15, grupo: 'C', ronda: 2, equipo_local: 'Brasil',       equipo_visitante: 'Haití',       fecha: '2026-06-19' },
  { id: 16, grupo: 'C', ronda: 2, equipo_local: 'Marruecos',    equipo_visitante: 'Escocia',     fecha: '2026-06-19' },
  { id: 17, grupo: 'C', ronda: 3, equipo_local: 'Brasil',       equipo_visitante: 'Escocia',     fecha: '2026-06-28' },
  { id: 18, grupo: 'C', ronda: 3, equipo_local: 'Haití',        equipo_visitante: 'Marruecos',   fecha: '2026-06-28' },

  // Grupo D
  { id: 19, grupo: 'D', ronda: 1, equipo_local: 'Estados Unidos', equipo_visitante: 'Paraguay',  fecha: '2026-06-14' },
  { id: 20, grupo: 'D', ronda: 1, equipo_local: 'Australia',    equipo_visitante: 'Turquía',     fecha: '2026-06-14' },
  { id: 21, grupo: 'D', ronda: 2, equipo_local: 'Estados Unidos', equipo_visitante: 'Australia', fecha: '2026-06-20' },
  { id: 22, grupo: 'D', ronda: 2, equipo_local: 'Paraguay',     equipo_visitante: 'Turquía',     fecha: '2026-06-20' },
  { id: 23, grupo: 'D', ronda: 3, equipo_local: 'Estados Unidos', equipo_visitante: 'Turquía',   fecha: '2026-06-29' },
  { id: 24, grupo: 'D', ronda: 3, equipo_local: 'Australia',    equipo_visitante: 'Paraguay',    fecha: '2026-06-29' },

  // Grupo E
  { id: 25, grupo: 'E', ronda: 1, equipo_local: 'Alemania',     equipo_visitante: 'Curazao',     fecha: '2026-06-11' },
  { id: 26, grupo: 'E', ronda: 1, equipo_local: 'Costa de Marfil', equipo_visitante: 'Ecuador',  fecha: '2026-06-11' },
  { id: 27, grupo: 'E', ronda: 2, equipo_local: 'Alemania',     equipo_visitante: 'Costa de Marfil', fecha: '2026-06-17' },
  { id: 28, grupo: 'E', ronda: 2, equipo_local: 'Curazao',      equipo_visitante: 'Ecuador',     fecha: '2026-06-17' },
  { id: 29, grupo: 'E', ronda: 3, equipo_local: 'Alemania',     equipo_visitante: 'Ecuador',     fecha: '2026-06-26' },
  { id: 30, grupo: 'E', ronda: 3, equipo_local: 'Costa de Marfil', equipo_visitante: 'Curazao',  fecha: '2026-06-26' },

  // Grupo F
  { id: 31, grupo: 'F', ronda: 1, equipo_local: 'Países Bajos', equipo_visitante: 'Japón',       fecha: '2026-06-12' },
  { id: 32, grupo: 'F', ronda: 1, equipo_local: 'Suecia',       equipo_visitante: 'Túnez',       fecha: '2026-06-12' },
  { id: 33, grupo: 'F', ronda: 2, equipo_local: 'Países Bajos', equipo_visitante: 'Suecia',      fecha: '2026-06-18' },
  { id: 34, grupo: 'F', ronda: 2, equipo_local: 'Japón',        equipo_visitante: 'Túnez',       fecha: '2026-06-18' },
  { id: 35, grupo: 'F', ronda: 3, equipo_local: 'Países Bajos', equipo_visitante: 'Túnez',       fecha: '2026-06-27' },
  { id: 36, grupo: 'F', ronda: 3, equipo_local: 'Japón',        equipo_visitante: 'Suecia',      fecha: '2026-06-27' },

  // Grupo G
  { id: 37, grupo: 'G', ronda: 1, equipo_local: 'Bélgica',      equipo_visitante: 'Egipto',      fecha: '2026-06-13' },
  { id: 38, grupo: 'G', ronda: 1, equipo_local: 'Irán',         equipo_visitante: 'Nueva Zelanda', fecha: '2026-06-13' },
  { id: 39, grupo: 'G', ronda: 2, equipo_local: 'Bélgica',      equipo_visitante: 'Irán',        fecha: '2026-06-19' },
  { id: 40, grupo: 'G', ronda: 2, equipo_local: 'Egipto',       equipo_visitante: 'Nueva Zelanda', fecha: '2026-06-19' },
  { id: 41, grupo: 'G', ronda: 3, equipo_local: 'Bélgica',      equipo_visitante: 'Nueva Zelanda', fecha: '2026-06-28' },
  { id: 42, grupo: 'G', ronda: 3, equipo_local: 'Irán',         equipo_visitante: 'Egipto',      fecha: '2026-06-28' },

  // Grupo H
  { id: 43, grupo: 'H', ronda: 1, equipo_local: 'España',       equipo_visitante: 'Cabo Verde',  fecha: '2026-06-14' },
  { id: 44, grupo: 'H', ronda: 1, equipo_local: 'Arabia Saudita', equipo_visitante: 'Uruguay',   fecha: '2026-06-14' },
  { id: 45, grupo: 'H', ronda: 2, equipo_local: 'España',       equipo_visitante: 'Arabia Saudita', fecha: '2026-06-20' },
  { id: 46, grupo: 'H', ronda: 2, equipo_local: 'Cabo Verde',   equipo_visitante: 'Uruguay',     fecha: '2026-06-20' },
  { id: 47, grupo: 'H', ronda: 3, equipo_local: 'España',       equipo_visitante: 'Uruguay',     fecha: '2026-06-29' },
  { id: 48, grupo: 'H', ronda: 3, equipo_local: 'Arabia Saudita', equipo_visitante: 'Cabo Verde', fecha: '2026-06-29' },

  // Grupo I
  { id: 49, grupo: 'I', ronda: 1, equipo_local: 'Francia',      equipo_visitante: 'Senegal',     fecha: '2026-06-15' },
  { id: 50, grupo: 'I', ronda: 1, equipo_local: 'Noruega',      equipo_visitante: 'Irak',        fecha: '2026-06-15' },
  { id: 51, grupo: 'I', ronda: 2, equipo_local: 'Francia',      equipo_visitante: 'Noruega',     fecha: '2026-06-21' },
  { id: 52, grupo: 'I', ronda: 2, equipo_local: 'Senegal',      equipo_visitante: 'Irak',        fecha: '2026-06-21' },
  { id: 53, grupo: 'I', ronda: 3, equipo_local: 'Francia',      equipo_visitante: 'Irak',        fecha: '2026-06-30' },
  { id: 54, grupo: 'I', ronda: 3, equipo_local: 'Noruega',      equipo_visitante: 'Senegal',     fecha: '2026-06-30' },

  // Grupo J
  { id: 55, grupo: 'J', ronda: 1, equipo_local: 'Argentina',    equipo_visitante: 'Argelia',     fecha: '2026-06-15' },
  { id: 56, grupo: 'J', ronda: 1, equipo_local: 'Austria',      equipo_visitante: 'Jordania',    fecha: '2026-06-15' },
  { id: 57, grupo: 'J', ronda: 2, equipo_local: 'Argentina',    equipo_visitante: 'Austria',     fecha: '2026-06-21' },
  { id: 58, grupo: 'J', ronda: 2, equipo_local: 'Argelia',      equipo_visitante: 'Jordania',    fecha: '2026-06-21' },
  { id: 59, grupo: 'J', ronda: 3, equipo_local: 'Argentina',    equipo_visitante: 'Jordania',    fecha: '2026-06-30' },
  { id: 60, grupo: 'J', ronda: 3, equipo_local: 'Austria',      equipo_visitante: 'Argelia',     fecha: '2026-06-30' },

  // Grupo K
  { id: 61, grupo: 'K', ronda: 1, equipo_local: 'Portugal',     equipo_visitante: 'Uzbekistán',  fecha: '2026-06-13' },
  { id: 62, grupo: 'K', ronda: 1, equipo_local: 'Colombia',     equipo_visitante: 'RD Congo',    fecha: '2026-06-13' },
  { id: 63, grupo: 'K', ronda: 2, equipo_local: 'Portugal',     equipo_visitante: 'Colombia',    fecha: '2026-06-20' },
  { id: 64, grupo: 'K', ronda: 2, equipo_local: 'Uzbekistán',   equipo_visitante: 'RD Congo',    fecha: '2026-06-20' },
  { id: 65, grupo: 'K', ronda: 3, equipo_local: 'Portugal',     equipo_visitante: 'RD Congo',    fecha: '2026-07-01' },
  { id: 66, grupo: 'K', ronda: 3, equipo_local: 'Colombia',     equipo_visitante: 'Uzbekistán',  fecha: '2026-07-01' },

  // Grupo L
  { id: 67, grupo: 'L', ronda: 1, equipo_local: 'Inglaterra',   equipo_visitante: 'Croacia',     fecha: '2026-06-14' },
  { id: 68, grupo: 'L', ronda: 1, equipo_local: 'Ghana',        equipo_visitante: 'Panamá',      fecha: '2026-06-14' },
  { id: 69, grupo: 'L', ronda: 2, equipo_local: 'Inglaterra',   equipo_visitante: 'Ghana',       fecha: '2026-06-22' },
  { id: 70, grupo: 'L', ronda: 2, equipo_local: 'Croacia',      equipo_visitante: 'Panamá',      fecha: '2026-06-22' },
  { id: 71, grupo: 'L', ronda: 3, equipo_local: 'Inglaterra',   equipo_visitante: 'Panamá',      fecha: '2026-07-02' },
  { id: 72, grupo: 'L', ronda: 3, equipo_local: 'Croacia',      equipo_visitante: 'Ghana',       fecha: '2026-07-02' },
]

// Bracket structure for eliminatorias
// Each slot defines where the two teams come from
export type SlotOrigen =
  | { tipo: 'grupo'; grupo: string; pos: number }
  | { tipo: 'best3'; pos: number }
  | { tipo: 'ganador'; fase: string; slot: number }

export interface BracketSlot {
  slot: number
  l: SlotOrigen
  v: SlotOrigen
}

export const BRACKET_DIECISEISAVOS: BracketSlot[] = [
  { slot: 1,  l: { tipo: 'grupo', grupo: 'A', pos: 1 }, v: { tipo: 'grupo', grupo: 'B', pos: 2 } },
  { slot: 2,  l: { tipo: 'grupo', grupo: 'B', pos: 1 }, v: { tipo: 'grupo', grupo: 'A', pos: 2 } },
  { slot: 3,  l: { tipo: 'grupo', grupo: 'C', pos: 1 }, v: { tipo: 'grupo', grupo: 'D', pos: 2 } },
  { slot: 4,  l: { tipo: 'grupo', grupo: 'D', pos: 1 }, v: { tipo: 'grupo', grupo: 'C', pos: 2 } },
  { slot: 5,  l: { tipo: 'grupo', grupo: 'E', pos: 1 }, v: { tipo: 'grupo', grupo: 'F', pos: 2 } },
  { slot: 6,  l: { tipo: 'grupo', grupo: 'F', pos: 1 }, v: { tipo: 'grupo', grupo: 'E', pos: 2 } },
  { slot: 7,  l: { tipo: 'grupo', grupo: 'G', pos: 1 }, v: { tipo: 'grupo', grupo: 'H', pos: 2 } },
  { slot: 8,  l: { tipo: 'grupo', grupo: 'H', pos: 1 }, v: { tipo: 'grupo', grupo: 'G', pos: 2 } },
  { slot: 9,  l: { tipo: 'grupo', grupo: 'I', pos: 1 }, v: { tipo: 'grupo', grupo: 'J', pos: 2 } },
  { slot: 10, l: { tipo: 'grupo', grupo: 'J', pos: 1 }, v: { tipo: 'grupo', grupo: 'I', pos: 2 } },
  { slot: 11, l: { tipo: 'grupo', grupo: 'K', pos: 1 }, v: { tipo: 'grupo', grupo: 'L', pos: 2 } },
  { slot: 12, l: { tipo: 'grupo', grupo: 'L', pos: 1 }, v: { tipo: 'grupo', grupo: 'K', pos: 2 } },
  { slot: 13, l: { tipo: 'best3', pos: 1 }, v: { tipo: 'best3', pos: 2 } },
  { slot: 14, l: { tipo: 'best3', pos: 3 }, v: { tipo: 'best3', pos: 4 } },
  { slot: 15, l: { tipo: 'best3', pos: 5 }, v: { tipo: 'best3', pos: 6 } },
  { slot: 16, l: { tipo: 'best3', pos: 7 }, v: { tipo: 'best3', pos: 8 } },
]

export const BRACKET_OCTAVOS: BracketSlot[] = [
  { slot: 1, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 1  }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 2  } },
  { slot: 2, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 3  }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 4  } },
  { slot: 3, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 5  }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 6  } },
  { slot: 4, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 7  }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 8  } },
  { slot: 5, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 9  }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 10 } },
  { slot: 6, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 11 }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 12 } },
  { slot: 7, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 13 }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 14 } },
  { slot: 8, l: { tipo: 'ganador', fase: 'dieciseisavos', slot: 15 }, v: { tipo: 'ganador', fase: 'dieciseisavos', slot: 16 } },
]

export const BRACKET_CUARTOS: BracketSlot[] = [
  { slot: 1, l: { tipo: 'ganador', fase: 'octavos', slot: 1 }, v: { tipo: 'ganador', fase: 'octavos', slot: 2 } },
  { slot: 2, l: { tipo: 'ganador', fase: 'octavos', slot: 3 }, v: { tipo: 'ganador', fase: 'octavos', slot: 4 } },
  { slot: 3, l: { tipo: 'ganador', fase: 'octavos', slot: 5 }, v: { tipo: 'ganador', fase: 'octavos', slot: 6 } },
  { slot: 4, l: { tipo: 'ganador', fase: 'octavos', slot: 7 }, v: { tipo: 'ganador', fase: 'octavos', slot: 8 } },
]

export const BRACKET_SEMIFINAL: BracketSlot[] = [
  { slot: 1, l: { tipo: 'ganador', fase: 'cuartos', slot: 1 }, v: { tipo: 'ganador', fase: 'cuartos', slot: 2 } },
  { slot: 2, l: { tipo: 'ganador', fase: 'cuartos', slot: 3 }, v: { tipo: 'ganador', fase: 'cuartos', slot: 4 } },
]

export const BRACKET_FINAL: BracketSlot[] = [
  { slot: 1, l: { tipo: 'ganador', fase: 'semifinal', slot: 1 }, v: { tipo: 'ganador', fase: 'semifinal', slot: 2 } },
]

export const BRACKETS: Record<string, BracketSlot[]> = {
  dieciseisavos: BRACKET_DIECISEISAVOS,
  octavos: BRACKET_OCTAVOS,
  cuartos: BRACKET_CUARTOS,
  semifinal: BRACKET_SEMIFINAL,
  final: BRACKET_FINAL,
}

// Compute group standings from user's score predictions
export function calcularClasificacion(
  pronosticos: Record<number, { goles_local: number; goles_visitante: number }>
): Record<string, ClasificacionGrupo[]> {
  const result: Record<string, ClasificacionGrupo[]> = {}

  for (const [grupo, equipos] of Object.entries(GRUPOS_DATA)) {
    const stats: Record<string, ClasificacionGrupo> = {}
    for (const eq of equipos) {
      stats[eq] = { equipo: eq, pts: 0, pj: 0, gf: 0, gc: 0, gd: 0 }
    }

    const partidos = PARTIDOS_GRUPOS.filter(p => p.grupo === grupo)
    for (const p of partidos) {
      const pron = pronosticos[p.id]
      if (pron === undefined) continue
      const { goles_local: gl, goles_visitante: gv } = pron
      stats[p.equipo_local].pj++
      stats[p.equipo_visitante].pj++
      stats[p.equipo_local].gf += gl
      stats[p.equipo_local].gc += gv
      stats[p.equipo_visitante].gf += gv
      stats[p.equipo_visitante].gc += gl

      if (gl > gv) {
        stats[p.equipo_local].pts += 3
      } else if (gl === gv) {
        stats[p.equipo_local].pts += 1
        stats[p.equipo_visitante].pts += 1
      } else {
        stats[p.equipo_visitante].pts += 3
      }
    }

    for (const eq of equipos) {
      stats[eq].gd = stats[eq].gf - stats[eq].gc
    }

    result[grupo] = equipos
      .map(eq => stats[eq])
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.equipo.localeCompare(b.equipo))
  }

  return result
}

// Returns the 8 best 3rd-place teams sorted by pts/GD/GF
export function getBest3rds(clasificaciones: Record<string, ClasificacionGrupo[]>): string[] {
  const terceros: ClasificacionGrupo[] = Object.values(clasificaciones)
    .filter(c => c.length >= 3)
    .map(c => c[2])

  return terceros
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.equipo.localeCompare(b.equipo))
    .slice(0, 8)
    .map(t => t.equipo)
}
