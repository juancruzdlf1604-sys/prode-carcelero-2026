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
}

export interface ResultadosBonus {
  campeon?: string
  subcampeon?: string
  goleador?: string
  guante_oro?: string
  mejor_joven?: string
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

export const SELECCIONES_MUNDIAL: string[] = [
  'Argentina', 'Australia', 'Albania', 'Arabia Saudita',
  'Alemania', 'Bélgica', 'Bolivia', 'Brasil',
  'Camerún', 'Canadá', 'China', 'Colombia',
  'Corea del Sur', 'Croacia', 'Dinamarca', 'Ecuador',
  'Escocia', 'Eslovenia', 'España', 'Estados Unidos',
  'Francia', 'Guinea', 'Honduras', 'Inglaterra',
  'Irak', 'Israel', 'Italia', 'Japón',
  'Kenia', 'Kuwait', 'Marruecos', 'México',
  'Nigeria', 'Países Bajos', 'Panamá', 'Paraguay',
  'Portugal', 'Rumania', 'Serbia', 'Senegal',
  'Sudáfrica', 'Suiza', 'Túnez', 'Uruguay',
  'Venezuela',
]

export const BANDERAS: Record<string, string> = {
  'Argentina': '🇦🇷',
  'Australia': '🇦🇺',
  'Albania': '🇦🇱',
  'Arabia Saudita': '🇸🇦',
  'Alemania': '🇩🇪',
  'Bélgica': '🇧🇪',
  'Bolivia': '🇧🇴',
  'Brasil': '🇧🇷',
  'Camerún': '🇨🇲',
  'Canadá': '🇨🇦',
  'China': '🇨🇳',
  'Colombia': '🇨🇴',
  'Corea del Sur': '🇰🇷',
  'Croacia': '🇭🇷',
  'Dinamarca': '🇩🇰',
  'Ecuador': '🇪🇨',
  'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Eslovenia': '🇸🇮',
  'España': '🇪🇸',
  'Estados Unidos': '🇺🇸',
  'Francia': '🇫🇷',
  'Guinea': '🇬🇳',
  'Honduras': '🇭🇳',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Irak': '🇮🇶',
  'Israel': '🇮🇱',
  'Italia': '🇮🇹',
  'Japón': '🇯🇵',
  'Kenia': '🇰🇪',
  'Kuwait': '🇰🇼',
  'Marruecos': '🇲🇦',
  'México': '🇲🇽',
  'Nigeria': '🇳🇬',
  'Países Bajos': '🇳🇱',
  'Panamá': '🇵🇦',
  'Paraguay': '🇵🇾',
  'Portugal': '🇵🇹',
  'Rumania': '🇷🇴',
  'Serbia': '🇷🇸',
  'Senegal': '🇸🇳',
  'Sudáfrica': '🇿🇦',
  'Suiza': '🇨🇭',
  'Túnez': '🇹🇳',
  'Uruguay': '🇺🇾',
  'Venezuela': '🇻🇪',
}
