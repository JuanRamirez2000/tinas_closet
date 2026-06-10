-- Add Season as a system tag group with standard seasonal values
DO $$
DECLARE
  v_user_id  UUID;
  v_season_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM members LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No members found — skipping season seed. Run after first sign-in.';
    RETURN;
  END IF;

  INSERT INTO tag_groups (created_by, name, is_system)
  VALUES (v_user_id, 'Season', TRUE)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_season_id FROM tag_groups WHERE name = 'Season' AND is_system LIMIT 1;

  INSERT INTO tags (group_id, value) VALUES
    (v_season_id, 'Spring'),
    (v_season_id, 'Summer'),
    (v_season_id, 'Fall'),
    (v_season_id, 'Winter'),
    (v_season_id, 'All-season')
  ON CONFLICT DO NOTHING;
END;
$$;
