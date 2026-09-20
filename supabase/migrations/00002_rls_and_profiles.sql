-- =============================================================================
-- CleanCity Migration 00002: RLS Policies, Constraints & Demo Seed Profiles
-- =============================================================================

SET search_path TO public, extensions;

-- 1. Adjust profiles id to allow default UUID generation and uncouple hard auth dependency for demo/guest flow
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies (public read, public insert/update for demo)
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to profiles" ON profiles;
CREATE POLICY "Allow public insert to profiles" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to profiles" ON profiles;
CREATE POLICY "Allow public update to profiles" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Reports policies (public read, public insert, public update for lifecycle)
DROP POLICY IF EXISTS "Allow public read access to reports" ON reports;
CREATE POLICY "Allow public read access to reports" ON reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to reports" ON reports;
CREATE POLICY "Allow public insert to reports" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to reports" ON reports;
CREATE POLICY "Allow public update to reports" ON reports FOR UPDATE USING (true) WITH CHECK (true);

-- Report Evidence policies
DROP POLICY IF EXISTS "Allow public read access to evidence" ON report_evidence;
CREATE POLICY "Allow public read access to evidence" ON report_evidence FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to evidence" ON report_evidence;
CREATE POLICY "Allow public insert to evidence" ON report_evidence FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to evidence" ON report_evidence;
CREATE POLICY "Allow public update to evidence" ON report_evidence FOR UPDATE USING (true) WITH CHECK (true);

-- Report Timeline policies
DROP POLICY IF EXISTS "Allow public read access to timeline" ON report_timeline;
CREATE POLICY "Allow public read access to timeline" ON report_timeline FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to timeline" ON report_timeline;
CREATE POLICY "Allow public insert to timeline" ON report_timeline FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to timeline" ON report_timeline;
CREATE POLICY "Allow public update to timeline" ON report_timeline FOR UPDATE USING (true) WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Allow public read access to notifications" ON notifications;
CREATE POLICY "Allow public read access to notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to notifications" ON notifications;
CREATE POLICY "Allow public insert to notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to notifications" ON notifications;
CREATE POLICY "Allow public update to notifications" ON notifications FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Seed Core Demo Profiles
INSERT INTO profiles (id, name, email, role, trust_score, points)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Prakash Hegde', 'prakash@example.com', 'citizen', 94, 2840),
  ('00000000-0000-0000-0000-000000000002', 'Lakshmi Iyer', 'lakshmi@example.com', 'citizen', 88, 1560),
  ('a1000000-0000-0000-0000-000000000001', 'Mohan Raj', 'mohan.raj@mysuru.gov.in', 'official', 99, 5200),
  ('b1000000-0000-0000-0000-000000000001', 'Mysuru Green Guardians', 'contact@green-guardians.org', 'ngo', 96, 3840)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;
