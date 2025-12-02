-- ============================================================================
-- Add Audit Columns Migration
-- ============================================================================
-- Adds created_by and updated_by columns to all tables for audit tracking

-- ============================================================================
-- ADD COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Image Sets: already has created_by, add updated_by
ALTER TABLE image_sets
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Rooms: add created_by and updated_by
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Players: add created_by and updated_by
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Game History: add created_by (updated_by not needed as history is immutable)
ALTER TABLE game_history
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ============================================================================
-- UPDATE TRIGGER FUNCTION FOR AUDIT COLUMNS
-- ============================================================================

-- Drop old function and recreate with updated_by support
CREATE OR REPLACE FUNCTION update_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set created_by on insert
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE EXISTING TRIGGERS
-- ============================================================================

-- Drop old triggers
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
DROP TRIGGER IF EXISTS update_image_sets_updated_at ON image_sets;

-- Create new triggers with audit support
CREATE TRIGGER update_rooms_audit
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER update_players_audit
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER update_image_sets_audit
  BEFORE UPDATE ON image_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_columns();

-- Add created_by triggers
CREATE TRIGGER set_rooms_created_by
  BEFORE INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_players_created_by
  BEFORE INSERT ON players
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_image_sets_created_by
  BEFORE INSERT ON image_sets
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_game_history_created_by
  BEFORE INSERT ON game_history
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================

-- Add audit columns to profiles (created_by = id since user creates their own profile)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop old trigger
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

-- Create new trigger with audit support
CREATE TRIGGER update_profiles_audit
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_columns();

-- ============================================================================
-- INDEXES FOR AUDIT COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_players_created_by ON players(created_by);
CREATE INDEX IF NOT EXISTS idx_image_sets_created_by ON image_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_game_history_created_by ON game_history(created_by);
