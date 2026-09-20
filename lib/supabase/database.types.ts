/**
 * CleanCity — Supabase Database Types
 *
 * Hand-written to mirror supabase/migrations/00001_foundation.sql.
 * Can be replaced by auto-generated types via `supabase gen types typescript`
 * once a live Supabase project is provisioned.
 */

// ---------------------------------------------------------------------------
// Enum types (must match PostgreSQL custom ENUMs exactly)
// ---------------------------------------------------------------------------

export type UserRole = "citizen" | "official" | "ngo"

export type ReportStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "CLAIMED"
  | "CLEANUP_IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "BOUNTY"
  | "FLAGGED"
  | "REOPENED"

export type ReportCategory =
  | "garbage_accumulation"
  | "overflowing_bin"
  | "illegal_dumping"
  | "dirty_public_area"
  | "drainage_problem"
  | "roadside_waste"
  | "other"

export type EvidenceType = "image" | "video"

// ---------------------------------------------------------------------------
// Database interface
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      // -------------------------------------------------------------------
      // profiles
      // -------------------------------------------------------------------
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          role: UserRole
          avatar_url: string | null
          phone: string | null
          organization: string | null
          ward_number: number | null
          trust_score: number
          points: number
          reports_submitted: number
          follow_ups_submitted: number
          verified_contributions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email?: string | null
          role?: UserRole
          avatar_url?: string | null
          phone?: string | null
          organization?: string | null
          ward_number?: number | null
          trust_score?: number
          points?: number
          reports_submitted?: number
          follow_ups_submitted?: number
          verified_contributions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          role?: UserRole
          avatar_url?: string | null
          phone?: string | null
          organization?: string | null
          ward_number?: number | null
          trust_score?: number
          points?: number
          reports_submitted?: number
          follow_ups_submitted?: number
          verified_contributions?: number
          created_at?: string
          updated_at?: string
        }
      }

      // -------------------------------------------------------------------
      // reports
      // -------------------------------------------------------------------
      reports: {
        Row: {
          id: string
          public_id: string
          reporter_id: string
          category: ReportCategory
          subcategory: string | null
          description: string
          location: unknown // PostGIS geography — opaque in TypeScript
          latitude: number
          longitude: number
          gps_accuracy: number | null
          captured_at: string | null
          ward_number: number | null
          ward_name: string | null
          location_name: string | null
          status: ReportStatus
          assigned_actor_id: string | null
          verifier_id: string | null
          sla_hours: number
          sla_breach_at: string | null
          is_overdue: boolean
          bounty_amount: number | null
          is_suspicious: boolean
          claimed_at: string | null
          cleanup_completed_at: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_id: string
          reporter_id: string
          category: ReportCategory
          subcategory?: string | null
          description: string
          location: unknown
          latitude: number
          longitude: number
          gps_accuracy?: number | null
          captured_at?: string | null
          ward_number?: number | null
          ward_name?: string | null
          location_name?: string | null
          status?: ReportStatus
          assigned_actor_id?: string | null
          verifier_id?: string | null
          sla_hours?: number
          sla_breach_at?: string | null
          is_overdue?: boolean
          bounty_amount?: number | null
          is_suspicious?: boolean
          claimed_at?: string | null
          cleanup_completed_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_id?: string
          reporter_id?: string
          category?: ReportCategory
          subcategory?: string | null
          description?: string
          location?: unknown
          latitude?: number
          longitude?: number
          gps_accuracy?: number | null
          captured_at?: string | null
          ward_number?: number | null
          ward_name?: string | null
          location_name?: string | null
          status?: ReportStatus
          assigned_actor_id?: string | null
          verifier_id?: string | null
          sla_hours?: number
          sla_breach_at?: string | null
          is_overdue?: boolean
          bounty_amount?: number | null
          is_suspicious?: boolean
          claimed_at?: string | null
          cleanup_completed_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // -------------------------------------------------------------------
      // report_evidence
      // -------------------------------------------------------------------
      report_evidence: {
        Row: {
          id: string
          report_id: string
          type: EvidenceType
          url: string
          storage_path: string | null
          thumbnail_url: string | null
          captured_at: string | null
          uploaded_at: string
          caption: string | null
          is_after_cleanup: boolean
        }
        Insert: {
          id?: string
          report_id: string
          type: EvidenceType
          url: string
          storage_path?: string | null
          thumbnail_url?: string | null
          captured_at?: string | null
          uploaded_at?: string
          caption?: string | null
          is_after_cleanup?: boolean
        }
        Update: {
          id?: string
          report_id?: string
          type?: EvidenceType
          url?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          captured_at?: string | null
          uploaded_at?: string
          caption?: string | null
          is_after_cleanup?: boolean
        }
      }

      // -------------------------------------------------------------------
      // report_timeline
      // -------------------------------------------------------------------
      report_timeline: {
        Row: {
          id: string
          report_id: string
          event_type: string
          status: ReportStatus | null
          description: string
          actor_id: string | null
          actor_name: string | null
          media_count: number | null
          details: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          event_type: string
          status?: ReportStatus | null
          description: string
          actor_id?: string | null
          actor_name?: string | null
          media_count?: number | null
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          event_type?: string
          status?: ReportStatus | null
          description?: string
          actor_id?: string | null
          actor_name?: string | null
          media_count?: number | null
          details?: Record<string, unknown> | null
          created_at?: string
        }
      }

      // -------------------------------------------------------------------
      // notifications
      // -------------------------------------------------------------------
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          message: string
          report_id: string | null
          report_public_id: string | null
          read: boolean
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: string
          title: string
          message: string
          report_id?: string | null
          report_public_id?: string | null
          read?: boolean
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: string
          title?: string
          message?: string
          report_id?: string | null
          report_public_id?: string | null
          read?: boolean
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
    }

    Views: Record<string, never>

    Functions: Record<string, never>

    Enums: {
      user_role: UserRole
      report_status: ReportStatus
      report_category: ReportCategory
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience type aliases
// ---------------------------------------------------------------------------

/** Shorthand for a table Row type */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

/** Shorthand for a table Insert type */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

/** Shorthand for a table Update type */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

/** Shorthand for a database enum */
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// ---------------------------------------------------------------------------
// Per-table row aliases (ergonomic imports)
// ---------------------------------------------------------------------------

export type ProfileRow = Tables<"profiles">
export type ReportRow = Tables<"reports">
export type ReportEvidenceRow = Tables<"report_evidence">
export type ReportTimelineRow = Tables<"report_timeline">
export type NotificationRow = Tables<"notifications">
