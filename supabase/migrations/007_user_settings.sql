-- Add per-user settings to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS closet_name TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'cupcake';
