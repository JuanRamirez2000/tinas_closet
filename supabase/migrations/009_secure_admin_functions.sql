-- Add admin checks to get_members and get_pending_members so only admins can call them
CREATE OR REPLACE FUNCTION get_members()
RETURNS TABLE (user_id UUID, email TEXT, is_admin BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT m.user_id, au.email, m.is_admin
    FROM members m
    JOIN auth.users au ON au.id = m.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_pending_members()
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = au.id);
END;
$$;
