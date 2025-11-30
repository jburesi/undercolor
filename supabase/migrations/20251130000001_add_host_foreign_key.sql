-- ============================================================================
-- Add foreign key constraint on rooms.host_id -> players.id
-- ============================================================================

-- First, make host_id nullable temporarily for room creation flow
ALTER TABLE rooms ALTER COLUMN host_id DROP NOT NULL;

-- Add foreign key constraint (nullable, set null on delete)
ALTER TABLE rooms
ADD CONSTRAINT fk_rooms_host_id
FOREIGN KEY (host_id) REFERENCES players(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX idx_rooms_host_id ON rooms(host_id);
