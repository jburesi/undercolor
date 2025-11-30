-- ============================================================================
-- Undercolor Game Tables Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE game_state AS ENUM (
  'LOBBY',
  'DISTRIBUTING',
  'OBSERVATION',
  'DEBATE',
  'VOTING',
  'RESOLVING',
  'FINISHED'
);

CREATE TYPE player_role AS ENUM (
  'INNOCENT',
  'IMPOSTER',
  'MR_WHITE'
);

CREATE TYPE connection_status AS ENUM (
  'CONNECTED',
  'DISCONNECTED',
  'RECONNECTING'
);

CREATE TYPE difficulty_level AS ENUM (
  'easy',
  'medium',
  'hard'
);

-- ============================================================================
-- IMAGE SETS TABLE (Admin managed)
-- ============================================================================

CREATE TABLE image_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  innocent_image_url TEXT NOT NULL,
  imposter_image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  state game_state NOT NULL DEFAULT 'LOBBY',
  current_round INTEGER NOT NULL DEFAULT 0,
  current_image_set_id UUID REFERENCES image_sets(id) ON DELETE SET NULL,
  winner player_role,

  -- Game configuration (stored as JSONB for flexibility)
  config JSONB NOT NULL DEFAULT '{
    "observationTime": 15,
    "debateTime": 120,
    "votingTime": 30,
    "includeMrWhite": false,
    "minPlayers": 3,
    "maxPlayers": 20
  }'::jsonb,

  -- Phase timing
  phase_started_at TIMESTAMPTZ,
  phase_ends_at TIMESTAMPTZ,

  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for room code lookups
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_state ON rooms(state);
CREATE INDEX idx_rooms_is_public ON rooms(is_public) WHERE state = 'LOBBY';

-- ============================================================================
-- PLAYERS TABLE (Game participants)
-- ============================================================================

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,

  -- Game state
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  has_voted BOOLEAN NOT NULL DEFAULT false,
  role player_role,
  connection_status connection_status NOT NULL DEFAULT 'CONNECTED',

  -- Vote target (null if hasn't voted)
  vote_target_id UUID REFERENCES players(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique session per room
  UNIQUE(room_id, session_id)
);

-- Create indexes for player lookups
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_session_id ON players(session_id);
CREATE INDEX idx_players_user_id ON players(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- GAME HISTORY TABLE (For user stats)
-- ============================================================================

CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,

  -- Game details
  room_code TEXT NOT NULL,
  role player_role NOT NULL,
  is_winner BOOLEAN NOT NULL,
  player_count INTEGER NOT NULL,
  duration_seconds INTEGER,
  image_set_name TEXT,

  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user stats queries
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_played_at ON game_history(played_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update timestamps
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_sets_updated_at
  BEFORE UPDATE ON image_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Rooms are viewable by everyone" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Rooms can be created by anyone" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Rooms can be updated by host" ON rooms
  FOR UPDATE USING (true);

-- Players policies
CREATE POLICY "Players are viewable by room participants" ON players
  FOR SELECT USING (true);

CREATE POLICY "Players can join rooms" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update their own data" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Players can leave rooms" ON players
  FOR DELETE USING (true);

-- Image sets policies
CREATE POLICY "Image sets are viewable by everyone" ON image_sets
  FOR SELECT USING (is_active = true);

CREATE POLICY "Image sets can be managed by admins" ON image_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Game history policies
CREATE POLICY "Users can view their own history" ON game_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "History can be inserted by system" ON game_history
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Enable realtime for rooms and players tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ============================================================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for game-images bucket
CREATE POLICY "Game images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Admins can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can delete game images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-images'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);
