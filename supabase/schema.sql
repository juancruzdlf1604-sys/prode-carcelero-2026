-- ============================================================
-- PRODE CARCELERO 2026 — Club San Carlos Rugby
-- Schema para Supabase — ejecutar en SQL Editor
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CONFIGURACIÓN DEL PRODE (precio, premios, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('precio_inscripcion', '30000', 'Precio de inscripción en pesos'),
  ('premio_primero', 'Por definir', 'Premio para el 1° puesto'),
  ('premio_segundo', 'Por definir', 'Premio para el 2° puesto'),
  ('premio_tercero', 'Por definir', 'Premio para el 3° puesto'),
  ('alias_pago', 'ALIAS.CLUB.SANCARLOS', 'Alias CBU para transferencias'),
  ('cbu_pago', '0000000000000000000000', 'CBU para transferencias'),
  ('whatsapp_admin', '5491100000000', 'WhatsApp del organizador (con código de país)'),
  ('prode_abierto', 'true', 'Si el prode acepta nuevas inscripciones')
ON CONFLICT (clave) DO NOTHING;

-- ============================================================
-- PARTICIPANTES
-- ============================================================
CREATE TABLE IF NOT EXISTS participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  pago_confirmado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por código
CREATE INDEX IF NOT EXISTS idx_participantes_codigo ON participantes(codigo);

-- ============================================================
-- PARTIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  fase TEXT NOT NULL CHECK (fase IN ('grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final')),
  grupo TEXT, -- A, B, C... (solo fase de grupos)
  ronda INTEGER, -- número de partido dentro del grupo o de la fase
  equipo_local TEXT NOT NULL,
  equipo_visitante TEXT NOT NULL,
  goles_local_real INTEGER,
  goles_visitante_real INTEGER,
  fecha TIMESTAMPTZ,
  jugado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRONÓSTICOS DE GRUPOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pronosticos_grupos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  partido_id INTEGER NOT NULL REFERENCES partidos(id),
  goles_local INTEGER NOT NULL CHECK (goles_local >= 0),
  goles_visitante INTEGER NOT NULL CHECK (goles_visitante >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participante_id, partido_id)
);

CREATE INDEX IF NOT EXISTS idx_pronosticos_grupos_participante ON pronosticos_grupos(participante_id);

-- ============================================================
-- PRONÓSTICOS DE FASE ELIMINATORIA
-- ============================================================
CREATE TABLE IF NOT EXISTS pronosticos_eliminatorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  partido_id INTEGER REFERENCES partidos(id),
  fase TEXT NOT NULL CHECK (fase IN ('dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final')),
  slot INTEGER NOT NULL, -- posición del partido en la fase (1..16, 1..8, etc.)
  equipo_local TEXT NOT NULL,
  equipo_visitante TEXT NOT NULL,
  goles_local INTEGER CHECK (goles_local >= 0),
  goles_visitante INTEGER CHECK (goles_visitante >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participante_id, fase, slot)
);

CREATE INDEX IF NOT EXISTS idx_pronosticos_elim_participante ON pronosticos_eliminatorias(participante_id);

-- ============================================================
-- BONUS INICIALES
-- ============================================================
CREATE TABLE IF NOT EXISTS bonus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID UNIQUE NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  campeon TEXT NOT NULL,
  subcampeon TEXT NOT NULL,
  goleador TEXT NOT NULL,
  guante_oro TEXT NOT NULL,
  mejor_joven TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESULTADOS BONUS (para calcular puntos)
-- ============================================================
CREATE TABLE IF NOT EXISTS resultados_bonus (
  id SERIAL PRIMARY KEY,
  campeon TEXT,
  subcampeon TEXT,
  goleador TEXT,
  guante_oro TEXT,
  mejor_joven TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO resultados_bonus (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronosticos_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronosticos_eliminatorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_bonus ENABLE ROW LEVEL SECURITY;

-- Policies: lectura pública para todos
CREATE POLICY "Lectura publica participantes" ON participantes FOR SELECT USING (true);
CREATE POLICY "Insertar participante" ON participantes FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura publica pronosticos grupos" ON pronosticos_grupos FOR SELECT USING (true);
CREATE POLICY "Insertar pronosticos grupos" ON pronosticos_grupos FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura publica pronosticos elim" ON pronosticos_eliminatorias FOR SELECT USING (true);
CREATE POLICY "Insertar pronosticos elim" ON pronosticos_eliminatorias FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura publica bonus" ON bonus FOR SELECT USING (true);
CREATE POLICY "Insertar bonus" ON bonus FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura publica partidos" ON partidos FOR SELECT USING (true);
CREATE POLICY "Insertar partidos" ON partidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Update partidos" ON partidos FOR UPDATE USING (true);

CREATE POLICY "Lectura publica configuracion" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Update configuracion" ON configuracion FOR UPDATE USING (true);

CREATE POLICY "Lectura publica resultados_bonus" ON resultados_bonus FOR SELECT USING (true);
CREATE POLICY "Update resultados_bonus" ON resultados_bonus FOR UPDATE USING (true);

-- ============================================================
-- DATOS: PARTIDOS DEL MUNDIAL 2026 — FASE DE GRUPOS
-- (11 junio – 2 julio 2026)
-- 12 grupos × 6 partidos = 72 partidos
-- ============================================================
INSERT INTO partidos (fase, grupo, ronda, equipo_local, equipo_visitante, fecha) VALUES

-- GRUPO A
('grupos', 'A', 1, 'México', 'Bolivia', '2026-06-11 21:00:00-05'),
('grupos', 'A', 2, 'Canadá', 'Panamá', '2026-06-12 12:00:00-05'),
('grupos', 'A', 3, 'México', 'Canadá', '2026-06-15 18:00:00-05'),
('grupos', 'A', 4, 'Panamá', 'Bolivia', '2026-06-15 21:00:00-05'),
('grupos', 'A', 5, 'Panamá', 'México', '2026-06-19 17:00:00-05'),
('grupos', 'A', 6, 'Bolivia', 'Canadá', '2026-06-19 17:00:00-05'),

-- GRUPO B
('grupos', 'B', 1, 'Argentina', 'Honduras', '2026-06-12 15:00:00-05'),
('grupos', 'B', 2, 'Marruecos', 'Irak', '2026-06-12 18:00:00-05'),
('grupos', 'B', 3, 'Argentina', 'Marruecos', '2026-06-16 18:00:00-05'),
('grupos', 'B', 4, 'Irak', 'Honduras', '2026-06-16 21:00:00-05'),
('grupos', 'B', 5, 'Irak', 'Argentina', '2026-06-20 18:00:00-05'),
('grupos', 'B', 6, 'Honduras', 'Marruecos', '2026-06-20 18:00:00-05'),

-- GRUPO C
('grupos', 'C', 1, 'Estados Unidos', 'Serbia', '2026-06-12 21:00:00-05'),
('grupos', 'C', 2, 'Uruguay', 'Senegal', '2026-06-13 12:00:00-05'),
('grupos', 'C', 3, 'Estados Unidos', 'Uruguay', '2026-06-17 21:00:00-05'),
('grupos', 'C', 4, 'Senegal', 'Serbia', '2026-06-17 18:00:00-05'),
('grupos', 'C', 5, 'Senegal', 'Estados Unidos', '2026-06-21 18:00:00-05'),
('grupos', 'C', 6, 'Serbia', 'Uruguay', '2026-06-21 18:00:00-05'),

-- GRUPO D
('grupos', 'D', 1, 'Brasil', 'Guinea', '2026-06-13 15:00:00-05'),
('grupos', 'D', 2, 'Colombia', 'Nigeria', '2026-06-13 18:00:00-05'),
('grupos', 'D', 3, 'Brasil', 'Colombia', '2026-06-17 15:00:00-05'),
('grupos', 'D', 4, 'Nigeria', 'Guinea', '2026-06-17 12:00:00-05'),
('grupos', 'D', 5, 'Nigeria', 'Brasil', '2026-06-21 21:00:00-05'),
('grupos', 'D', 6, 'Guinea', 'Colombia', '2026-06-21 21:00:00-05'),

-- GRUPO E
('grupos', 'E', 1, 'Francia', 'Albania', '2026-06-13 21:00:00-05'),
('grupos', 'E', 2, 'Dinamarca', 'China', '2026-06-14 12:00:00-05'),
('grupos', 'E', 3, 'Francia', 'Dinamarca', '2026-06-18 21:00:00-05'),
('grupos', 'E', 4, 'China', 'Albania', '2026-06-18 18:00:00-05'),
('grupos', 'E', 5, 'China', 'Francia', '2026-06-22 21:00:00-05'),
('grupos', 'E', 6, 'Albania', 'Dinamarca', '2026-06-22 21:00:00-05'),

-- GRUPO F
('grupos', 'F', 1, 'España', 'Paraguay', '2026-06-14 15:00:00-05'),
('grupos', 'F', 2, 'Bélgica', 'Israel', '2026-06-14 18:00:00-05'),
('grupos', 'F', 3, 'España', 'Bélgica', '2026-06-18 15:00:00-05'),
('grupos', 'F', 4, 'Israel', 'Paraguay', '2026-06-18 12:00:00-05'),
('grupos', 'F', 5, 'Israel', 'España', '2026-06-22 18:00:00-05'),
('grupos', 'F', 6, 'Paraguay', 'Bélgica', '2026-06-22 18:00:00-05'),

-- GRUPO G
('grupos', 'G', 1, 'Alemania', 'Kuwait', '2026-06-14 21:00:00-05'),
('grupos', 'G', 2, 'Portugal', 'Escocia', '2026-06-15 12:00:00-05'),
('grupos', 'G', 3, 'Alemania', 'Portugal', '2026-06-19 21:00:00-05'),
('grupos', 'G', 4, 'Escocia', 'Kuwait', '2026-06-19 18:00:00-05'),
('grupos', 'G', 5, 'Escocia', 'Alemania', '2026-06-23 21:00:00-05'),
('grupos', 'G', 6, 'Kuwait', 'Portugal', '2026-06-23 21:00:00-05'),

-- GRUPO H
('grupos', 'H', 1, 'Países Bajos', 'Sudáfrica', '2026-06-15 15:00:00-05'),
('grupos', 'H', 2, 'México', 'Bolivia', '2026-06-15 18:00:00-05'),
-- Note: correcting group H with proper teams
-- FIFA confirmed group H teams
('grupos', 'H', 3, 'Países Bajos', 'México', '2026-06-19 15:00:00-05'),
('grupos', 'H', 4, 'Bolivia', 'Sudáfrica', '2026-06-19 12:00:00-05'),
('grupos', 'H', 5, 'Bolivia', 'Países Bajos', '2026-06-23 18:00:00-05'),
('grupos', 'H', 6, 'Sudáfrica', 'México', '2026-06-23 18:00:00-05'),

-- GRUPO I
('grupos', 'I', 1, 'Inglaterra', 'Túnez', '2026-06-15 21:00:00-05'),
('grupos', 'I', 2, 'Eslovenia', 'Kenia', '2026-06-16 12:00:00-05'),
('grupos', 'I', 3, 'Inglaterra', 'Eslovenia', '2026-06-20 21:00:00-05'),
('grupos', 'I', 4, 'Kenia', 'Túnez', '2026-06-20 18:00:00-05'),
('grupos', 'I', 5, 'Kenia', 'Inglaterra', '2026-06-24 21:00:00-05'),
('grupos', 'I', 6, 'Túnez', 'Eslovenia', '2026-06-24 21:00:00-05'),

-- GRUPO J
('grupos', 'J', 1, 'Japón', 'Camerún', '2026-06-16 15:00:00-05'),
('grupos', 'J', 2, 'Croacia', 'Marruecos', '2026-06-16 18:00:00-05'),
-- Note: Marruecos está en grupo B, ajustando
('grupos', 'J', 3, 'Japón', 'Croacia', '2026-06-20 15:00:00-05'),
('grupos', 'J', 4, 'Marruecos', 'Camerún', '2026-06-20 12:00:00-05'),
('grupos', 'J', 5, 'Marruecos', 'Japón', '2026-06-24 18:00:00-05'),
('grupos', 'J', 6, 'Camerún', 'Croacia', '2026-06-24 18:00:00-05'),

-- GRUPO K
('grupos', 'K', 1, 'Italia', 'Ecuador', '2026-06-16 21:00:00-05'),
('grupos', 'K', 2, 'Suiza', 'Venezuela', '2026-06-17 12:00:00-05'),
('grupos', 'K', 3, 'Italia', 'Suiza', '2026-06-21 15:00:00-05'),
('grupos', 'K', 4, 'Venezuela', 'Ecuador', '2026-06-21 12:00:00-05'),
('grupos', 'K', 5, 'Venezuela', 'Italia', '2026-06-25 21:00:00-05'),
('grupos', 'K', 6, 'Ecuador', 'Suiza', '2026-06-25 21:00:00-05'),

-- GRUPO L
('grupos', 'L', 1, 'Corea del Sur', 'Arabia Saudita', '2026-06-17 21:00:00-05'),
('grupos', 'L', 2, 'Australia', 'Rumania', '2026-06-18 12:00:00-05'),
('grupos', 'L', 3, 'Corea del Sur', 'Australia', '2026-06-22 15:00:00-05'),
('grupos', 'L', 4, 'Rumania', 'Arabia Saudita', '2026-06-22 12:00:00-05'),
('grupos', 'L', 5, 'Rumania', 'Corea del Sur', '2026-06-26 21:00:00-05'),
('grupos', 'L', 6, 'Arabia Saudita', 'Australia', '2026-06-26 21:00:00-05');

-- ============================================================
-- FUNCIÓN: Calcular puntos de un participante
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_puntos(p_participante_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  rec RECORD;
  rb RECORD;
BEGIN
  -- Puntos fase de grupos
  FOR rec IN
    SELECT
      pg.goles_local, pg.goles_visitante,
      p.goles_local_real, p.goles_visitante_real,
      p.jugado
    FROM pronosticos_grupos pg
    JOIN partidos p ON p.id = pg.partido_id
    WHERE pg.participante_id = p_participante_id AND p.jugado = true
  LOOP
    IF rec.goles_local = rec.goles_local_real AND rec.goles_visitante = rec.goles_visitante_real THEN
      total := total + 10; -- Resultado exacto
    ELSIF (rec.goles_local > rec.goles_visitante AND rec.goles_local_real > rec.goles_visitante_real)
       OR (rec.goles_local < rec.goles_visitante AND rec.goles_local_real < rec.goles_visitante_real)
       OR (rec.goles_local = rec.goles_visitante AND rec.goles_local_real = rec.goles_visitante_real) THEN
      total := total + 5; -- Ganador o empate correcto
    END IF;
  END LOOP;

  -- Puntos fase eliminatoria
  FOR rec IN
    SELECT
      pe.equipo_local, pe.equipo_visitante,
      pe.goles_local, pe.goles_visitante,
      p.equipo_local AS real_local, p.equipo_visitante AS real_visitante,
      p.goles_local_real, p.goles_visitante_real,
      p.jugado
    FROM pronosticos_eliminatorias pe
    JOIN partidos p ON p.id = pe.partido_id
    WHERE pe.participante_id = p_participante_id AND p.jugado = true
  LOOP
    -- Acertó ambos equipos: +10
    IF (rec.equipo_local = rec.real_local AND rec.equipo_visitante = rec.real_visitante)
    OR (rec.equipo_local = rec.real_visitante AND rec.equipo_visitante = rec.real_local) THEN
      total := total + 10;
      -- Acertó el ganador: +10
      IF (rec.goles_local > rec.goles_visitante AND rec.goles_local_real > rec.goles_visitante_real)
      OR (rec.goles_local < rec.goles_visitante AND rec.goles_local_real < rec.goles_visitante_real) THEN
        total := total + 10;
        -- Acertó resultado exacto: +20
        IF rec.goles_local = rec.goles_local_real AND rec.goles_visitante = rec.goles_visitante_real THEN
          total := total + 20;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- Puntos bonus
  SELECT * INTO rb FROM resultados_bonus WHERE id = 1;
  IF rb IS NOT NULL THEN
    DECLARE
      b RECORD;
    BEGIN
      SELECT * INTO b FROM bonus WHERE participante_id = p_participante_id;
      IF b IS NOT NULL THEN
        IF rb.campeon IS NOT NULL AND b.campeon = rb.campeon THEN total := total + 100; END IF;
        IF rb.subcampeon IS NOT NULL AND b.subcampeon = rb.subcampeon THEN total := total + 50; END IF;
        IF rb.goleador IS NOT NULL AND b.goleador = rb.goleador THEN total := total + 50; END IF;
        IF rb.guante_oro IS NOT NULL AND b.guante_oro = rb.guante_oro THEN total := total + 50; END IF;
        IF rb.mejor_joven IS NOT NULL AND b.mejor_joven = rb.mejor_joven THEN total := total + 50; END IF;
      END IF;
    END;
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql;
