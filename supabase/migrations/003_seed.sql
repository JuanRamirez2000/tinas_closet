-- Seed system tag groups and starter values
-- These are inserted with a placeholder created_by (first member).
-- Run after at least one user has signed in and been added to members.

-- NOTE: This seed is intentionally a template.
-- Replace '<YOUR_USER_UUID>' with a real member UUID before running.
-- You can find your UUID at: Supabase Dashboard → Authentication → Users

DO $$
DECLARE
  v_user_id UUID;
  v_color_id UUID;
  v_type_id  UUID;
  v_style_id UUID;
BEGIN
  -- Use the first member as the system seed owner
  SELECT user_id INTO v_user_id FROM members LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No members found — skipping seed. Run after first sign-in.';
    RETURN;
  END IF;

  INSERT INTO tag_groups (created_by, name, is_system) VALUES
    (v_user_id, 'Color', TRUE),
    (v_user_id, 'Type',  TRUE),
    (v_user_id, 'Style', TRUE)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_color_id;

  -- Fetch the IDs we just created
  SELECT id INTO v_color_id FROM tag_groups WHERE name = 'Color' AND is_system LIMIT 1;
  SELECT id INTO v_type_id  FROM tag_groups WHERE name = 'Type'  AND is_system LIMIT 1;
  SELECT id INTO v_style_id FROM tag_groups WHERE name = 'Style' AND is_system LIMIT 1;

  INSERT INTO tags (group_id, value) VALUES
    (v_color_id, 'Black'),
    (v_color_id, 'White'),
    (v_color_id, 'Blue'),
    (v_color_id, 'Red'),
    (v_color_id, 'Green'),
    (v_color_id, 'Gray'),
    (v_type_id,  'T-Shirt'),
    (v_type_id,  'Pants'),
    (v_type_id,  'Dress'),
    (v_type_id,  'Jacket'),
    (v_type_id,  'Shoes'),
    (v_type_id,  'Accessory'),
    (v_style_id, 'Casual'),
    (v_style_id, 'Formal'),
    (v_style_id, 'Sport'),
    (v_style_id, 'Outdoor')
  ON CONFLICT DO NOTHING;
END;
$$;
