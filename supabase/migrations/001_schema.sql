-- Profiles: mirror of auth.users for app-level data
CREATE TABLE profiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name  TEXT
);

-- Members: the two allowed accounts for this shared closet
-- Add the second account manually after first sign-in:
--   INSERT INTO members (user_id) VALUES ('<second-user-uuid>');
CREATE TABLE members (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE
);

-- Base locations (e.g. "Juan's", "Tina's")
CREATE TABLE base_locations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  name       TEXT NOT NULL
);

-- Storage locations (e.g. "Bin A", "Closet") — each belongs to one base
CREATE TABLE storage_locations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  base_id    UUID NOT NULL REFERENCES base_locations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL
);

-- Items
CREATE TABLE items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          UUID NOT NULL REFERENCES profiles(id),
  name                TEXT NOT NULL,
  notes               TEXT,
  image_url           TEXT,
  storage_location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
  status              TEXT,    -- 'available' | 'laundry' | null
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tag groups (e.g. "Color", "Type")
CREATE TABLE tag_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  name       TEXT NOT NULL,
  is_system  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tags (values within a group)
CREATE TABLE tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES tag_groups(id) ON DELETE CASCADE,
  value    TEXT NOT NULL,
  UNIQUE (group_id, value)
);

-- Many-to-many: items <-> tags
CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Outfits
CREATE TABLE outfits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  name       TEXT NOT NULL
);

-- Many-to-many: outfits <-> items
CREATE TABLE outfit_items (
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id   UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, item_id)
);
