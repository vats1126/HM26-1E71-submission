-- =============================================================================
-- CleanCity Foundation Migration
-- Civic issue management platform for Mysuru municipal governance
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure search_path includes extensions schema (standard Supabase extension location)
SET search_path TO public, extensions;

-- ---------------------------------------------------------------------------
-- 2. Custom ENUM types (aligned with lib/types.ts)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'official', 'ngo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'OPEN',
    'ACKNOWLEDGED',
    'CLAIMED',
    'CLEANUP_IN_PROGRESS',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'BOUNTY',
    'FLAGGED',
    'REOPENED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_category AS ENUM (
    'garbage_accumulation',
    'overflowing_bin',
    'illegal_dumping',
    'dirty_public_area',
    'drainage_problem',
    'roadside_waste',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Trigger function — auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 4. profiles table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT        NOT NULL,
  email                   TEXT,
  role                    user_role   NOT NULL DEFAULT 'citizen',
  avatar_url              TEXT,
  phone                   TEXT,
  organization            TEXT,        -- for NGOs
  ward_number             INTEGER,     -- for officials
  trust_score             INTEGER     NOT NULL DEFAULT 50,
  points                  INTEGER     NOT NULL DEFAULT 0,
  reports_submitted       INTEGER     NOT NULL DEFAULT 0,
  follow_ups_submitted    INTEGER     NOT NULL DEFAULT 0,
  verified_contributions  INTEGER     NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.trust_score IS 'Community trust score 0-100, starts at 50';
COMMENT ON COLUMN profiles.organization IS 'Organization name, applicable for NGO users';
COMMENT ON COLUMN profiles.ward_number IS 'Assigned ward, applicable for official users';

-- ---------------------------------------------------------------------------
-- 5. reports table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id             TEXT              NOT NULL UNIQUE,
  reporter_id           UUID              NOT NULL REFERENCES profiles(id),
  category              report_category   NOT NULL,
  subcategory           TEXT,
  description           TEXT              NOT NULL,

  -- Geography
  location              GEOGRAPHY(Point, 4326) NOT NULL,
  latitude              DOUBLE PRECISION  NOT NULL,
  longitude             DOUBLE PRECISION  NOT NULL,
  gps_accuracy          DOUBLE PRECISION,
  captured_at           TIMESTAMPTZ,

  -- Ward / location info
  ward_number           INTEGER,
  ward_name             TEXT,
  location_name         TEXT,

  -- Status & assignment
  status                report_status     NOT NULL DEFAULT 'OPEN',
  assigned_actor_id     UUID              REFERENCES profiles(id),
  verifier_id           UUID              REFERENCES profiles(id),

  -- SLA
  sla_hours             INTEGER           NOT NULL DEFAULT 48,
  sla_breach_at         TIMESTAMPTZ,
  is_overdue            BOOLEAN           NOT NULL DEFAULT false,

  -- Bounty
  bounty_amount         INTEGER,

  -- Flags
  is_suspicious         BOOLEAN           NOT NULL DEFAULT false,

  -- Timestamps
  claimed_at            TIMESTAMPTZ,
  cleanup_completed_at  TIMESTAMPTZ,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT now(),

  -- Integrity constraints
  CONSTRAINT chk_reporter_not_actor
    CHECK (reporter_id IS DISTINCT FROM assigned_actor_id),
  CONSTRAINT chk_actor_not_verifier
    CHECK (assigned_actor_id IS NULL OR assigned_actor_id IS DISTINCT FROM verifier_id)
);

COMMENT ON TABLE  reports IS 'Civic issue reports with geographic anchoring';
COMMENT ON COLUMN reports.public_id IS 'Human-readable civic identifier, e.g. MC-1001';
COMMENT ON COLUMN reports.location IS 'PostGIS geography point (SRID 4326) for spatial queries';
COMMENT ON COLUMN reports.sla_hours IS 'Service-level agreement deadline in hours from creation';
COMMENT ON COLUMN reports.is_suspicious IS 'Flagged by AI or community for suspicious content';

-- ---------------------------------------------------------------------------
-- 6. report_evidence table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_evidence (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('image', 'video')),
  url             TEXT        NOT NULL,
  storage_path    TEXT,
  thumbnail_url   TEXT,
  captured_at     TIMESTAMPTZ,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  caption         TEXT,
  is_after_cleanup BOOLEAN   NOT NULL DEFAULT false
);

COMMENT ON TABLE  report_evidence IS 'Before and after media evidence attached to reports';
COMMENT ON COLUMN report_evidence.is_after_cleanup IS 'true = after-cleanup evidence, false = initial evidence';

-- ---------------------------------------------------------------------------
-- 7. report_timeline table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_timeline (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     UUID          NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  event_type    TEXT          NOT NULL,
  status        report_status,
  description   TEXT          NOT NULL,
  actor_id      UUID          REFERENCES profiles(id),
  actor_name    TEXT,
  media_count   INTEGER,
  details       JSONB,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE report_timeline IS 'Chronological activity log for each report';

-- ---------------------------------------------------------------------------
-- 8. notifications table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id     UUID        NOT NULL REFERENCES profiles(id),
  type             TEXT        NOT NULL,
  title            TEXT        NOT NULL,
  message          TEXT        NOT NULL,
  report_id        UUID        REFERENCES reports(id),
  report_public_id TEXT,
  read             BOOLEAN     NOT NULL DEFAULT false,
  icon             TEXT,
  color            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'In-app notifications for users';

-- ---------------------------------------------------------------------------
-- 9. Indexes
-- ---------------------------------------------------------------------------

-- Geographic queries (nearest reports, within-radius searches)
CREATE INDEX IF NOT EXISTS idx_reports_location
  ON reports USING GIST (location);

-- Status-based filtering
CREATE INDEX IF NOT EXISTS idx_reports_status
  ON reports (status);

-- Ward-based filtering
CREATE INDEX IF NOT EXISTS idx_reports_ward_number
  ON reports (ward_number);

-- Reporter's own reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
  ON reports (reporter_id);

-- Latest reports first
CREATE INDEX IF NOT EXISTS idx_reports_created_at_desc
  ON reports (created_at DESC);

-- Unread notifications per user
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read
  ON notifications (recipient_id, read);

-- Timeline entries ordered by time for a report
CREATE INDEX IF NOT EXISTS idx_report_timeline_report_created
  ON report_timeline (report_id, created_at);

-- Evidence lookup by report
CREATE INDEX IF NOT EXISTS idx_report_evidence_report_id
  ON report_evidence (report_id);

-- ---------------------------------------------------------------------------
-- 10. Triggers — auto-update updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
