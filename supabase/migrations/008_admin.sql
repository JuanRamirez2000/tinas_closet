-- Add admin flag to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark the owner account as admin
UPDATE members SET is_admin = TRUE WHERE user_id = 'de8bdbdc-aead-43c5-a5f2-e87db3bc7a94';

-- Fix default theme for new sign-ups
ALTER TABLE profiles ALTER COLUMN theme SET DEFAULT 'cupcake';

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = TRUE
  );
$$;

-- Admin: list all members with their emails
CREATE OR REPLACE FUNCTION get_members()
RETURNS TABLE (user_id UUID, email TEXT, is_admin BOOLEAN)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT m.user_id, au.email, m.is_admin
  FROM members m
  JOIN auth.users au ON au.id = m.user_id;
$$;

-- Admin: list users who signed up but aren't members yet
CREATE OR REPLACE FUNCTION get_pending_members()
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT au.id, au.email
  FROM auth.users au
  WHERE NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = au.id);
$$;

-- Admin: approve a pending user
CREATE OR REPLACE FUNCTION add_member(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO members (user_id) VALUES (target_user_id) ON CONFLICT DO NOTHING;
END;
$$;
