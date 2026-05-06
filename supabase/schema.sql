-- ============================================================
-- PRODE CARCELERO 2026 — Club San Carlos Rugby
-- Schema para Supabase — ejecutar en SQL Editor
-- Idempotente: se puede correr N veces, borra y recrea todo
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- LIMPIEZA — eliminar tablas en orden de dependencias
-- ============================================================
DROP TABLE IF EXISTS pronosticos_grupos       CASCADE;
DROP TABLE IF EXISTS pronosticos_eliminatorias CASCADE;
DROP TABLE IF EXISTS bonus                    CASCADE;
DROP TABLE IF EXISTS resultados_bonus         CASCADE;
DROP TABLE IF EXISTS partidos                 CASCADE;
DROP TABLE IF EXISTS participantes            CASCADE;
DROP TABLE IF EXISTS configuracion            CASCADE;

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
  ('premio_primero',     'Por definir', 'Premio para el 1° puesto'),
  ('premio_segundo',     'Por definir', 'Premio para el 2° puesto'),
  ('premio_tercero',     'Por definir', 'Premio para el 3° puesto'),
  ('alias_pago',         'ALIAS.CLUB.SANCARLOS', 'Alias CBU para transferencias'),
  ('cbu_pago',           '0000000000000000000000', 'CBU para transferencias'),
  ('whatsapp_admin',     '5491100000000', 'WhatsApp del organizador (con código de país)'),
  ('prode_abierto',      'true', 'Si el prode acepta nuevas inscripciones')
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

CREATE INDEX IF NOT EXISTS idx_participantes_codigo ON participantes(codigo);

-- ============================================================
-- PARTIDOS (referencia oficial — el admin carga resultados acá)
-- ============================================================
CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  fase TEXT NOT NULL CHECK (fase IN ('grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final')),
  grupo TEXT,
  ronda INTEGER,
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
-- partido_id es el ID del partido en partidos-data.ts (1-72)
-- NO tiene FK a partidos para no depender de que esa tabla esté poblada
-- ============================================================
CREATE TABLE IF NOT EXISTS pronosticos_grupos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  partido_id INTEGER NOT NULL,
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
  fase TEXT NOT NULL CHECK (fase IN ('dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'final')),
  slot INTEGER NOT NULL,
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
-- RESULTADOS BONUS (el admin carga el ganador real)
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

-- Lectura pública + insert abierto (sin login)
DROP POLICY IF EXISTS "Lectura publica participantes"      ON participantes;
DROP POLICY IF EXISTS "Insertar participante"              ON participantes;
CREATE POLICY "Lectura publica participantes"      ON participantes            FOR SELECT USING (true);
CREATE POLICY "Insertar participante"              ON participantes            FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura publica pronosticos grupos" ON pronosticos_grupos;
DROP POLICY IF EXISTS "Insertar pronosticos grupos"        ON pronosticos_grupos;
CREATE POLICY "Lectura publica pronosticos grupos" ON pronosticos_grupos       FOR SELECT USING (true);
CREATE POLICY "Insertar pronosticos grupos"        ON pronosticos_grupos       FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura publica pronosticos elim"   ON pronosticos_eliminatorias;
DROP POLICY IF EXISTS "Insertar pronosticos elim"          ON pronosticos_eliminatorias;
CREATE POLICY "Lectura publica pronosticos elim"   ON pronosticos_eliminatorias FOR SELECT USING (true);
CREATE POLICY "Insertar pronosticos elim"          ON pronosticos_eliminatorias FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura publica bonus"              ON bonus;
DROP POLICY IF EXISTS "Insertar bonus"                     ON bonus;
CREATE POLICY "Lectura publica bonus"              ON bonus                    FOR SELECT USING (true);
CREATE POLICY "Insertar bonus"                     ON bonus                    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura publica partidos"           ON partidos;
DROP POLICY IF EXISTS "Insertar partidos"                  ON partidos;
DROP POLICY IF EXISTS "Update partidos"                    ON partidos;
CREATE POLICY "Lectura publica partidos"           ON partidos                 FOR SELECT USING (true);
CREATE POLICY "Insertar partidos"                  ON partidos                 FOR INSERT WITH CHECK (true);
CREATE POLICY "Update partidos"                    ON partidos                 FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Lectura publica configuracion"      ON configuracion;
DROP POLICY IF EXISTS "Update configuracion"               ON configuracion;
CREATE POLICY "Lectura publica configuracion"      ON configuracion            FOR SELECT USING (true);
CREATE POLICY "Update configuracion"               ON configuracion            FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Lectura publica resultados_bonus"   ON resultados_bonus;
DROP POLICY IF EXISTS "Update resultados_bonus"            ON resultados_bonus;
CREATE POLICY "Lectura publica resultados_bonus"   ON resultados_bonus         FOR SELECT USING (true);
CREATE POLICY "Update resultados_bonus"            ON resultados_bonus         FOR UPDATE USING (true);

-- ============================================================
-- FIXTURE OFICIAL MUNDIAL 2026 — FASE DE GRUPOS
-- 12 grupos × 6 partidos = 72 partidos
-- IDs 1–72 coinciden con los IDs en lib/partidos-data.ts
-- Grupos: A..L, equipos según fixture confirmado
-- Formato round-robin por grupo [T1,T2,T3,T4]:
--   MD1: T1 vs T2, T3 vs T4
--   MD2: T1 vs T3, T2 vs T4
--   MD3: T1 vs T4, T2 vs T3
-- ============================================================
INSERT INTO partidos (id, fase, grupo, ronda, equipo_local, equipo_visitante, fecha) OVERRIDING SYSTEM VALUE VALUES

-- GRUPO A: México, Sudáfrica, Corea del Sur, Chequia
(1,  'grupos', 'A', 1, 'México',        'Sudáfrica',              '2026-06-11'),
(2,  'grupos', 'A', 1, 'Corea del Sur', 'Chequia',                '2026-06-11'),
(3,  'grupos', 'A', 2, 'México',        'Corea del Sur',          '2026-06-17'),
(4,  'grupos', 'A', 2, 'Sudáfrica',     'Chequia',                '2026-06-17'),
(5,  'grupos', 'A', 3, 'México',        'Chequia',                '2026-06-26'),
(6,  'grupos', 'A', 3, 'Corea del Sur', 'Sudáfrica',              '2026-06-26'),

-- GRUPO B: Canadá, Bosnia y Herzegovina, Catar, Suiza
(7,  'grupos', 'B', 1, 'Canadá',               'Bosnia y Herzegovina', '2026-06-12'),
(8,  'grupos', 'B', 1, 'Catar',                'Suiza',                '2026-06-12'),
(9,  'grupos', 'B', 2, 'Canadá',               'Catar',                '2026-06-18'),
(10, 'grupos', 'B', 2, 'Bosnia y Herzegovina', 'Suiza',                '2026-06-18'),
(11, 'grupos', 'B', 3, 'Canadá',               'Suiza',                '2026-06-27'),
(12, 'grupos', 'B', 3, 'Catar',                'Bosnia y Herzegovina', '2026-06-27'),

-- GRUPO C: Brasil, Marruecos, Haití, Escocia
(13, 'grupos', 'C', 1, 'Brasil',    'Marruecos', '2026-06-13'),
(14, 'grupos', 'C', 1, 'Haití',     'Escocia',   '2026-06-13'),
(15, 'grupos', 'C', 2, 'Brasil',    'Haití',      '2026-06-19'),
(16, 'grupos', 'C', 2, 'Marruecos', 'Escocia',   '2026-06-19'),
(17, 'grupos', 'C', 3, 'Brasil',    'Escocia',   '2026-06-28'),
(18, 'grupos', 'C', 3, 'Haití',     'Marruecos', '2026-06-28'),

-- GRUPO D: Estados Unidos, Paraguay, Australia, Turquía
(19, 'grupos', 'D', 1, 'Estados Unidos', 'Paraguay',   '2026-06-14'),
(20, 'grupos', 'D', 1, 'Australia',      'Turquía',    '2026-06-14'),
(21, 'grupos', 'D', 2, 'Estados Unidos', 'Australia',  '2026-06-20'),
(22, 'grupos', 'D', 2, 'Paraguay',       'Turquía',    '2026-06-20'),
(23, 'grupos', 'D', 3, 'Estados Unidos', 'Turquía',    '2026-06-29'),
(24, 'grupos', 'D', 3, 'Australia',      'Paraguay',   '2026-06-29'),

-- GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
(25, 'grupos', 'E', 1, 'Alemania',        'Curazao',          '2026-06-11'),
(26, 'grupos', 'E', 1, 'Costa de Marfil', 'Ecuador',          '2026-06-11'),
(27, 'grupos', 'E', 2, 'Alemania',        'Costa de Marfil',  '2026-06-17'),
(28, 'grupos', 'E', 2, 'Curazao',         'Ecuador',          '2026-06-17'),
(29, 'grupos', 'E', 3, 'Alemania',        'Ecuador',          '2026-06-26'),
(30, 'grupos', 'E', 3, 'Costa de Marfil', 'Curazao',          '2026-06-26'),

-- GRUPO F: Países Bajos, Japón, Suecia, Túnez
(31, 'grupos', 'F', 1, 'Países Bajos', 'Japón',  '2026-06-12'),
(32, 'grupos', 'F', 1, 'Suecia',       'Túnez',  '2026-06-12'),
(33, 'grupos', 'F', 2, 'Países Bajos', 'Suecia', '2026-06-18'),
(34, 'grupos', 'F', 2, 'Japón',        'Túnez',  '2026-06-18'),
(35, 'grupos', 'F', 3, 'Países Bajos', 'Túnez',  '2026-06-27'),
(36, 'grupos', 'F', 3, 'Japón',        'Suecia', '2026-06-27'),

-- GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
(37, 'grupos', 'G', 1, 'Bélgica', 'Egipto',        '2026-06-13'),
(38, 'grupos', 'G', 1, 'Irán',    'Nueva Zelanda',  '2026-06-13'),
(39, 'grupos', 'G', 2, 'Bélgica', 'Irán',           '2026-06-19'),
(40, 'grupos', 'G', 2, 'Egipto',  'Nueva Zelanda',  '2026-06-19'),
(41, 'grupos', 'G', 3, 'Bélgica', 'Nueva Zelanda',  '2026-06-28'),
(42, 'grupos', 'G', 3, 'Irán',    'Egipto',         '2026-06-28'),

-- GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
(43, 'grupos', 'H', 1, 'España',         'Cabo Verde',     '2026-06-14'),
(44, 'grupos', 'H', 1, 'Arabia Saudita', 'Uruguay',        '2026-06-14'),
(45, 'grupos', 'H', 2, 'España',         'Arabia Saudita', '2026-06-20'),
(46, 'grupos', 'H', 2, 'Cabo Verde',     'Uruguay',        '2026-06-20'),
(47, 'grupos', 'H', 3, 'España',         'Uruguay',        '2026-06-29'),
(48, 'grupos', 'H', 3, 'Arabia Saudita', 'Cabo Verde',     '2026-06-29'),

-- GRUPO I: Francia, Senegal, Noruega, Irak
(49, 'grupos', 'I', 1, 'Francia', 'Senegal', '2026-06-15'),
(50, 'grupos', 'I', 1, 'Noruega', 'Irak',    '2026-06-15'),
(51, 'grupos', 'I', 2, 'Francia', 'Noruega', '2026-06-21'),
(52, 'grupos', 'I', 2, 'Senegal', 'Irak',    '2026-06-21'),
(53, 'grupos', 'I', 3, 'Francia', 'Irak',    '2026-06-30'),
(54, 'grupos', 'I', 3, 'Noruega', 'Senegal', '2026-06-30'),

-- GRUPO J: Argentina, Argelia, Austria, Jordania
(55, 'grupos', 'J', 1, 'Argentina', 'Argelia',  '2026-06-15'),
(56, 'grupos', 'J', 1, 'Austria',   'Jordania', '2026-06-15'),
(57, 'grupos', 'J', 2, 'Argentina', 'Austria',  '2026-06-21'),
(58, 'grupos', 'J', 2, 'Argelia',   'Jordania', '2026-06-21'),
(59, 'grupos', 'J', 3, 'Argentina', 'Jordania', '2026-06-30'),
(60, 'grupos', 'J', 3, 'Austria',   'Argelia',  '2026-06-30'),

-- GRUPO K: Portugal, Uzbekistán, Colombia, RD Congo
(61, 'grupos', 'K', 1, 'Portugal',   'Uzbekistán', '2026-06-13'),
(62, 'grupos', 'K', 1, 'Colombia',   'RD Congo',   '2026-06-13'),
(63, 'grupos', 'K', 2, 'Portugal',   'Colombia',   '2026-06-20'),
(64, 'grupos', 'K', 2, 'Uzbekistán', 'RD Congo',   '2026-06-20'),
(65, 'grupos', 'K', 3, 'Portugal',   'RD Congo',   '2026-07-01'),
(66, 'grupos', 'K', 3, 'Colombia',   'Uzbekistán', '2026-07-01'),

-- GRUPO L: Inglaterra, Croacia, Ghana, Panamá
(67, 'grupos', 'L', 1, 'Inglaterra', 'Croacia', '2026-06-14'),
(68, 'grupos', 'L', 1, 'Ghana',      'Panamá',  '2026-06-14'),
(69, 'grupos', 'L', 2, 'Inglaterra', 'Ghana',   '2026-06-22'),
(70, 'grupos', 'L', 2, 'Croacia',    'Panamá',  '2026-06-22'),
(71, 'grupos', 'L', 3, 'Inglaterra', 'Panamá',  '2026-07-02'),
(72, 'grupos', 'L', 3, 'Croacia',    'Ghana',   '2026-07-02')
ON CONFLICT (id) DO NOTHING;

-- Resetear el sequence de partidos para que próximos inserts (fase eliminatoria) continúen desde 73
SELECT setval('partidos_id_seq', 72);

-- ============================================================
-- FUNCIÓN: Calcular puntos de un participante
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_puntos(p_participante_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  rec RECORD;
  rb RECORD;
  b RECORD;
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

  -- Puntos bonus
  SELECT * INTO rb FROM resultados_bonus WHERE id = 1;
  IF rb IS NOT NULL THEN
    SELECT * INTO b FROM bonus WHERE participante_id = p_participante_id;
    IF b IS NOT NULL THEN
      IF rb.campeon IS NOT NULL AND b.campeon = rb.campeon THEN total := total + 100; END IF;
      IF rb.subcampeon IS NOT NULL AND b.subcampeon = rb.subcampeon THEN total := total + 50; END IF;
      IF rb.goleador IS NOT NULL AND lower(b.goleador) = lower(rb.goleador) THEN total := total + 50; END IF;
      IF rb.guante_oro IS NOT NULL AND lower(b.guante_oro) = lower(rb.guante_oro) THEN total := total + 50; END IF;
      IF rb.mejor_joven IS NOT NULL AND lower(b.mejor_joven) = lower(rb.mejor_joven) THEN total := total + 50; END IF;
    END IF;
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql;
