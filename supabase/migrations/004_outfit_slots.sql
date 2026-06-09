-- Outfit Builder (loadout) — adds named slots to the outfit system.
--
-- Design rationale:
-- outfit_slots is a global template table (not per-outfit) so the slot set
-- stays consistent across all outfits. Users can customize slots (rename,
-- reorder, add), but the same slot structure applies everywhere.
--
-- slot_id on outfit_items is nullable to keep existing flat rows valid.
-- Uniqueness for single-item slots (allow_multiple = false) is enforced
-- in the application layer rather than a partial unique constraint because
-- partial constraints referencing another table's column require a trigger
-- or a denormalised allow_multiple column on outfit_items. App-layer
-- enforcement is simpler, auditable, and avoids a cross-table constraint.

CREATE TABLE outfit_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID NOT NULL REFERENCES profiles(id),
  name          TEXT NOT NULL,
  display_order INT  NOT NULL DEFAULT 0,
  allow_multiple BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE outfit_items
  ADD COLUMN slot_id UUID REFERENCES outfit_slots(id) ON DELETE SET NULL;

-- RLS for outfit_slots: any member can read/write
ALTER TABLE outfit_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_all_outfit_slots"
  ON outfit_slots FOR ALL USING (is_member()) WITH CHECK (is_member());

-- Seed system slots.
-- Run after at least one member exists (same guard as 003_seed.sql).
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM members LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No members found — skipping slot seed.';
    RETURN;
  END IF;

  INSERT INTO outfit_slots (created_by, name, display_order, allow_multiple) VALUES
    (v_user_id, 'Layer',        1, FALSE),
    (v_user_id, 'Top',          2, FALSE),
    (v_user_id, 'Bottom',       3, FALSE),
    (v_user_id, 'Shoes',        4, FALSE),
    (v_user_id, 'Bag',          5, FALSE),
    (v_user_id, 'Accessories',  6, TRUE)
  ON CONFLICT DO NOTHING;
END;
$$;
