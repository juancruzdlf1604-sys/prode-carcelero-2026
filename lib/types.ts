export type Fase = 'grupos' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'

export interface Participante {
  id: string
  codigo: string
  nombre: string
  apellido: string
  whatsapp: string
  pago_confirmado: boolean
  created_at: string
}

export interface Partido {
  id: number
  fase: Fase
  grupo?: string
  ronda: number
  equipo_local: string
  equipo_visitante: string
  goles_local_real?: number
  goles_visitante_real?: number
  fecha?: string
  jugado: boolean
}

export interface PronosticoGrupo {
  id: string
  participante_id: string
  partido_id: number
  goles_local: number
  goles_visitante: number
}

export interface PronosticoEliminatoria {
  id: string
  participante_id: string
  partido_id?: number
  fase: Fase
  slot: number
  equipo_local: string
  equipo_visitante: string
  goles_local?: number
  goles_visitante?: number
}

export interface Bonus {
  id: string
  participante_id: string
  campeon: string
  subcampeon: string
  goleador: string
  guante_oro: string
  mejor_joven: string
  mejor_jugador?: string
}

export interface ResultadosBonus {
  campeon?: string
  subcampeon?: string
  goleador?: string
  guante_oro?: string
  mejor_joven?: string
  mejor_jugador?: string
}

export interface Configuracion {
  clave: string
  valor: string
  descripcion?: string
}

// Para el formulario del prode
export interface FormularioProde {
  nombre: string
  apellido: string
  whatsapp: string
  bonus: {
    campeon: string
    subcampeon: string
    goleador: string
    guante_oro: string
    mejor_joven: string
  }
  pronosticos: Record<number, { goles_local: number; goles_visitante: number }>
  eliminatorias: Record<string, { equipo_local: string; equipo_visitante: string; goles_local?: number; goles_visitante?: number }>
}

// Para la tabla de posiciones
export interface PosicionTabla {
  codigo: string
  nombre: string
  apellido: string
  pago_confirmado: boolean
  puntos: number
  exactos: number
}

// Exact 48 teams of the 2026 FIFA World Cup
export const SELECCIONES_MUNDIAL: string[] = [
  'México', 'Sudáfrica', 'Corea del Sur', 'Chequia',
  'Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza',
  'Brasil', 'Marruecos', 'Haití', 'Escocia',
  'Estados Unidos', 'Paraguay', 'Australia', 'Turquía',
  'Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador',
  'Países Bajos', 'Japón', 'Suecia', 'Túnez',
  'Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda',
  'España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay',
  'Francia', 'Senegal', 'Noruega', 'Irak',
  'Argentina', 'Argelia', 'Austria', 'Jordania',
  'Portugal', 'Uzbekistán', 'Colombia', 'RD Congo',
  'Inglaterra', 'Croacia', 'Ghana', 'Panamá',
].sort()

export const BANDERAS: Record<string, string> = {
  'Arabia Saudita': '🇸🇦',
  'Alemania': '🇩🇪',
  'Argelia': '🇩🇿',
  'Argentina': '🇦🇷',
  'Australia': '🇦🇺',
  'Austria': '🇦🇹',
  'Bélgica': '🇧🇪',
  'Bosnia y Herzegovina': '🇧🇦',
  'Brasil': '🇧🇷',
  'Cabo Verde': '🇨🇻',
  'Canadá': '🇨🇦',
  'Catar': '🇶🇦',
  'Chequia': '🇨🇿',
  'Colombia': '🇨🇴',
  'Corea del Sur': '🇰🇷',
  'Costa de Marfil': '🇨🇮',
  'Croacia': '🇭🇷',
  'Curazao': '🇨🇼',
  'Ecuador': '🇪🇨',
  'Egipto': '🇪🇬',
  'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'España': '🇪🇸',
  'Estados Unidos': '🇺🇸',
  'Francia': '🇫🇷',
  'Ghana': '🇬🇭',
  'Haití': '🇭🇹',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Irak': '🇮🇶',
  'Irán': '🇮🇷',
  'Japón': '🇯🇵',
  'Jordania': '🇯🇴',
  'Marruecos': '🇲🇦',
  'México': '🇲🇽',
  'Noruega': '🇳🇴',
  'Nueva Zelanda': '🇳🇿',
  'Países Bajos': '🇳🇱',
  'Panamá': '🇵🇦',
  'Paraguay': '🇵🇾',
  'Portugal': '🇵🇹',
  'RD Congo': '🇨🇩',
  'Senegal': '🇸🇳',
  'Sudáfrica': '🇿🇦',
  'Suecia': '🇸🇪',
  'Suiza': '🇨🇭',
  'Túnez': '🇹🇳',
  'Turquía': '🇹🇷',
  'Uruguay': '🇺🇾',
  'Uzbekistán': '🇺🇿',
}
