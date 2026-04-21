-- =============================================================================
-- TRANSMUTE — MIGRACIÓN SPRINT 5
-- La Cúspide de la Gran Obra: Leaderboard Global y Notificaciones
-- =============================================================================

-- =============================================================================
-- BLOQUE 1: Vista de Leaderboard Global
-- Permite obtener el ranking de todos los usuarios de forma eficiente.
-- =============================================================================

CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
  id as user_id,
  display_name,
  avatar,
  level,
  xp,
  rank() OVER (ORDER BY xp DESC, level DESC) as positioning
FROM profiles;

-- =============================================================================
-- BLOQUE 2: Sistema de Notificaciones In-App
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Quien recibe
  actor_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Quien causa (opcional)
  type          TEXT        NOT NULL CHECK (type IN ('follow', 'reaction', 'challenge_goal', 'system')),
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  link          TEXT,                                      -- Ruta interna a navegar
  is_read       BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications (user_id, is_read) WHERE is_read = FALSE;

-- =============================================================================
-- BLOQUE 3: RLS para Notificaciones
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON notifications;
CREATE POLICY "Usuarios ven sus propias notificaciones"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios marcan sus notificaciones como leidas" ON notifications;
CREATE POLICY "Usuarios marcan sus notificaciones como leidas"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- BLOQUE 4: Triggers para Notificaciones Automáticas
-- =============================================================================

-- 1. Notificación al recibir un Follow (Alianza)
CREATE OR REPLACE FUNCTION fn_notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, title, content, link)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    'Nueva Alianza Forjada',
    'Un adepto ha sincronizado su voluntad con la tuya.',
    '/tropa/' || NEW.follower_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_follow ON follows;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_on_follow();

-- 2. Notificación al recibir una Reacción
CREATE OR REPLACE FUNCTION fn_notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  v_target_user_id UUID;
BEGIN
  -- Obtener el dueño de la actividad reaccionada
  SELECT user_id INTO v_target_user_id FROM activity_feed WHERE id = NEW.activity_id;
  
  -- No notificar si el usuario reacciona a su propio feed
  IF v_target_user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, title, content, link)
    VALUES (
      v_target_user_id,
      NEW.user_id,
      'reaction',
      'Emanación Recibida',
      'Tu actividad ha generado una resonancia alquímica.',
      '/accountability'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_reaction ON feed_reactions;
CREATE TRIGGER trg_notify_reaction
  AFTER INSERT ON feed_reactions
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_on_reaction();

-- =============================================================================
-- CONFIGURACIÓN REALTIME
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
