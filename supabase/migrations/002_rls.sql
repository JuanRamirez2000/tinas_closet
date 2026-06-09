-- Helper: is the current auth user a member?
CREATE OR REPLACE FUNCTION is_member()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM members WHERE user_id = auth.uid()
  );
$$;

-- Enable RLS on every table
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_locations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items      ENABLE ROW LEVEL SECURITY;

-- profiles: members can read all; each user writes their own row
CREATE POLICY "members_select_profiles"
  ON profiles FOR SELECT USING (is_member());
CREATE POLICY "own_insert_profile"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "own_update_profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- members: members can read; only service role inserts (managed out-of-band)
CREATE POLICY "members_select_members"
  ON members FOR SELECT USING (is_member());

-- All closet data: any member can read/insert/update/delete
-- (created_by is audit only, not an access boundary)

CREATE POLICY "members_all_base_locations"
  ON base_locations FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_storage_locations"
  ON storage_locations FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_items"
  ON items FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_tag_groups"
  ON tag_groups FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_tags"
  ON tags FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_item_tags"
  ON item_tags FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_outfits"
  ON outfits FOR ALL USING (is_member()) WITH CHECK (is_member());

CREATE POLICY "members_all_outfit_items"
  ON outfit_items FOR ALL USING (is_member()) WITH CHECK (is_member());

-- Auto-insert profile on sign-up via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage bucket for item photos (run this separately in the Supabase dashboard
-- or via the CLI — Storage policies live outside SQL migrations):
-- 1. Create bucket "items" (private)
-- 2. Add policy: members can SELECT/INSERT/DELETE their paths
