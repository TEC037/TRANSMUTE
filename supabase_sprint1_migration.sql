-- =============================================================================
-- TRANSMUTE — MIGRACIÓN SPRINT 1
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Orden de ejecución: de arriba hacia abajo. Cada bloque es idempotente.
-- =============================================================================

-- =============================================================================
-- BLOQUE 1: Migrar completed_at a TIMESTAMPTZ
-- Permite análisis por hora del día y notificaciones adaptativas.
-- ATENCIÓN: Si ya tienes datos en 'completions', el cast DATE → TIMESTAMPTZ
--           los preserva añadiendo 00:00:00 UTC. No se pierden registros.
-- =============================================================================

DO $$
BEGIN
  -- Solo migrar si la columna existe como DATE o TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completions'
      AND column_name = 'completed_at'
      AND data_type IN ('date', 'character varying', 'text')
  ) THEN
    ALTER TABLE completions
      ALTER COLUMN completed_at TYPE TIMESTAMPTZ
      USING completed_at::TIMESTAMPTZ;
    RAISE NOTICE 'completions.completed_at migrado a TIMESTAMPTZ correctamente.';
  ELSE
    RAISE NOTICE 'completed_at ya es TIMESTAMPTZ o no existe. Sin cambios.';
  END IF;
END $$;

-- =============================================================================
-- BLOQUE 2: Tabla de feed de actividad social
-- Almacena eventos del feed de La Tropa. El trigger lo llena automáticamente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_feed (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL
                CHECK (type IN (
                  'habit_completed',
                  'streak_milestone',
                  'level_up',
                  'rank_achieved',
                  'challenge_joined',
                  'alliance_forged'
                )),
  payload     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para el feed de un usuario concreto, ordenado por tiempo (paginación cursor)
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_time
  ON activity_feed (user_id, created_at DESC);

-- =============================================================================
-- BLOQUE 3: Tabla de alianzas (follows)
-- Relación unidireccional: follower_id sigue a following_id.
-- =============================================================================

CREATE TABLE IF NOT EXISTS follows (
  follower_id   UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),

  -- Un usuario no puede seguirse a sí mismo
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_id);

-- =============================================================================
-- BLOQUE 4: Tabla de reacciones alquímicas al feed
-- Máx 1 reacción por (reactor_id, feed_item_id) por día — controlado en cliente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS feed_reactions (
  id           UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_item_id UUID  NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  reactor_id   UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT  NOT NULL DEFAULT 'resonance'
                CHECK (type IN ('resonance', 'fire', 'celestial')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_reactions_item ON feed_reactions (feed_item_id);

-- =============================================================================
-- BLOQUE 5: Row Level Security (RLS) — Aislamiento por usuario
-- Crítico para Free Tier: evita que un usuario lea el feed de otro
-- a menos que lo siga.
-- =============================================================================

-- Activar RLS en las tablas nuevas (si no está ya activo)
ALTER TABLE activity_feed   ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_reactions  ENABLE ROW LEVEL SECURITY;

-- ── activity_feed: un usuario puede insertar sus propios eventos
DROP POLICY IF EXISTS "Publicar en el feed propio" ON activity_feed;
CREATE POLICY "Publicar en el feed propio"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- activity_feed: leer solo eventos de usuarios que el caller sigue
DROP POLICY IF EXISTS "Leer feed de aliados" ON activity_feed;
CREATE POLICY "Leer feed de aliados"
  ON activity_feed FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid()
        AND following_id = activity_feed.user_id
    )
  );

-- ── follows: un usuario gestiona sus propias alianzas
DROP POLICY IF EXISTS "Gestionar propias alianzas" ON follows;
CREATE POLICY "Gestionar propias alianzas"
  ON follows FOR ALL
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- follows: cualquier usuario autenticado puede ver a quién sigue alguien
-- (necesario para la pantalla de perfil público)
DROP POLICY IF EXISTS "Ver alianzas publicas" ON follows;
CREATE POLICY "Ver alianzas publicas"
  ON follows FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── feed_reactions: gestionar propias reacciones
DROP POLICY IF EXISTS "Gestionar propias reacciones" ON feed_reactions;
CREATE POLICY "Gestionar propias reacciones"
  ON feed_reactions FOR ALL
  USING (auth.uid() = reactor_id)
  WITH CHECK (auth.uid() = reactor_id);

-- feed_reactions: leer reacciones de items visibles
DROP POLICY IF EXISTS "Leer reacciones de items visibles" ON feed_reactions;
CREATE POLICY "Leer reacciones de items visibles"
  ON feed_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- BLOQUE 6: Trigger para publicar en el feed automáticamente
-- Al insertar en 'completions', registra el evento en 'activity_feed'.
-- VENTAJA: Evita escrituras duplicadas desde el cliente.
-- =============================================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION fn_publish_completion_to_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos del owner, no del usuario
AS $$
DECLARE
  v_habit_name TEXT;
BEGIN
  -- Obtener el nombre del hábito para el payload
  SELECT name INTO v_habit_name
  FROM habits
  WHERE id = NEW.habit_id;

  -- Solo publicar si el usuario tiene perfil público (settings->>'isPublic' = 'true')
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.user_id
      AND (settings->>'isPublic')::boolean = true
  ) THEN
    INSERT INTO activity_feed (user_id, type, payload)
    VALUES (
      NEW.user_id,
      'habit_completed',
      jsonb_build_object(
        'habitName', COALESCE(v_habit_name, 'Hábito desconocido'),
        'habitId',   NEW.habit_id,
        'timestamp', NEW.completed_at
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Adjuntar trigger a la tabla completions
DROP TRIGGER IF EXISTS trg_completion_to_feed ON completions;
CREATE TRIGGER trg_completion_to_feed
  AFTER INSERT ON completions
  FOR EACH ROW
  EXECUTE FUNCTION fn_publish_completion_to_feed();

-- =============================================================================
-- BLOQUE 7: Realtime habilitado solo en activity_feed
-- Necesario para las actualizaciones en vivo de La Tropa.
-- =============================================================================

-- Habilitar publicación Realtime para la tabla activity_feed.
-- Supabase gestiona la publication 'supabase_realtime' internamente.
-- Solo añadimos las tablas necesarias; no recreamos la publication.
DO $$
BEGIN
  -- Intentar añadir activity_feed al canal Realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'activity_feed ya estaba en supabase_realtime o error: %', SQLERRM;
  END;

  -- Añadir completions para compatibilidad con el canal existente
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE completions;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'completions ya estaba en supabase_realtime o error: %', SQLERRM;
  END;
END $$;

-- =============================================================================
-- VERIFICACIÓN FINAL
-- Ejecutar para confirmar que todo fue creado correctamente.
-- =============================================================================

SELECT
  table_name,
  (SELECT COUNT(*) > 0 FROM information_schema.table_constraints
   WHERE table_name = t.table_name AND constraint_type = 'PRIMARY KEY') AS has_pk,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('activity_feed', 'follows', 'feed_reactions', 'completions')
ORDER BY table_name;
