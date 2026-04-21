-- =============================================================================
-- TRANSMUTE — MIGRACIÓN SPRINT 4
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Retos Colectivos curados por el equipo (sin UGC en v1).
-- =============================================================================

-- =============================================================================
-- BLOQUE 1: Tabla de Retos Colectivos
-- Creados por el equipo vía dashboard admin o insert directo.
-- =============================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL CHECK (char_length(title) <= 80),
  description   TEXT        CHECK (char_length(description) <= 300),
  habit_name    TEXT,                                      -- Hábito específico sugerido
  target_days   INTEGER     NOT NULL DEFAULT 7,            -- Duración del reto en días
  xp_reward     INTEGER     NOT NULL DEFAULT 200,          -- XP al completarlo
  start_date    DATE        NOT NULL,
  end_date      DATE        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'collective'
                  CHECK (type IN ('collective', 'competitive')),
  is_active     BOOLEAN     DEFAULT TRUE,
  cover_emoji   TEXT        DEFAULT '⚗️',
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  -- El equipo es siempre el creador (se puede dejar NULL para retos del sistema)
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Índice para listar retos activos ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_challenges_active
  ON challenges (is_active, start_date DESC);

-- =============================================================================
-- BLOQUE 2: Participantes de Reto
-- Tracking de progreso individual dentro de cada reto.
-- =============================================================================

CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id  UUID    NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id       UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  progress      INTEGER DEFAULT 0,      -- Días completados en el reto
  completed     BOOLEAN DEFAULT FALSE,  -- Si el usuario terminó el reto
  PRIMARY KEY (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge
  ON challenge_participants (challenge_id, progress DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_user
  ON challenge_participants (user_id);

-- =============================================================================
-- BLOQUE 3: Row Level Security
-- =============================================================================

ALTER TABLE challenges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- challenges: cualquier usuario autenticado puede leer retos activos
DROP POLICY IF EXISTS "Leer retos activos" ON challenges;
CREATE POLICY "Leer retos activos"
  ON challenges FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- challenge_participants: el usuario gestiona su propia participación
DROP POLICY IF EXISTS "Gestionar propia participacion" ON challenge_participants;
CREATE POLICY "Gestionar propia participacion"
  ON challenge_participants FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- challenge_participants: ver otros participantes del mismo reto
DROP POLICY IF EXISTS "Ver participantes del reto" ON challenge_participants;
CREATE POLICY "Ver participantes del reto"
  ON challenge_participants FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM challenge_participants cp2
      WHERE cp2.challenge_id = challenge_participants.challenge_id
        AND cp2.user_id = auth.uid()
    )
  );

-- =============================================================================
-- BLOQUE 4: Reto de ejemplo para pruebas
-- El equipo crea retos así vía SQL o dashboard de Supabase
-- =============================================================================

INSERT INTO challenges (title, description, habit_name, target_days, xp_reward, start_date, end_date, type, cover_emoji)
VALUES (
  '7 Días de Consciencia',
  'Siete ciclos de práctica ininterrumpida. La mente que se observa a sí misma inicia la Gran Obra.',
  'Anclaje del Vacío',
  7,
  400,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  'collective',
  '👁️'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- BLOQUE 5: Función para actualizar progreso del participante automáticamente
-- Trigger que incrementa progress cuando el usuario completa el hábito del reto
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_update_challenge_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_habit_name TEXT;
BEGIN
  -- Obtener el nombre del hábito completado
  SELECT name INTO v_habit_name FROM habits WHERE id = NEW.habit_id;

  -- Incrementar progreso en retos activos donde el hábito coincide
  UPDATE challenge_participants cp
  SET progress = cp.progress + 1,
      completed = (cp.progress + 1 >= c.target_days)
  FROM challenges c
  WHERE cp.challenge_id = c.id
    AND cp.user_id = NEW.user_id
    AND c.is_active = TRUE
    AND (c.habit_name IS NULL OR c.habit_name = v_habit_name)
    AND NEW.completed_at::DATE >= c.start_date
    AND NEW.completed_at::DATE <= c.end_date
    AND cp.completed = FALSE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_progress ON completions;
CREATE TRIGGER trg_challenge_progress
  AFTER INSERT ON completions
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_challenge_progress();

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('challenges', 'challenge_participants')
ORDER BY table_name;
