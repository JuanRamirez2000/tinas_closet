-- Add favorite flag to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS favorite boolean DEFAULT false NOT NULL;
