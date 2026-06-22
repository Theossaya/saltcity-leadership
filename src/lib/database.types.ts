// Hand-written to match supabase/migrations/00000000000001_init.sql.
// Regenerate once a live project exists:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          published_by: string
          priority: Database['public']['Enums']['notice_priority']
          audience: Database['public']['Enums']['audience_type']
          published_at: string
          expires_at: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          published_by: string
          priority?: Database['public']['Enums']['notice_priority']
          audience?: Database['public']['Enums']['audience_type']
          published_at?: string
          expires_at?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          published_by?: string
          priority?: Database['public']['Enums']['notice_priority']
          audience?: Database['public']['Enums']['audience_type']
          published_at?: string
          expires_at?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcements_published_by_fkey'
            columns: ['published_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      attendance_records: {
        Row: {
          id: string
          report_id: string
          member_id: string
          present: boolean
          absence_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          member_id: string
          present?: boolean
          absence_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          member_id?: string
          present?: boolean
          absence_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attendance_records_report_id_fkey'
            columns: ['report_id']
            isOneToOne: false
            referencedRelation: 'weekly_reports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_records_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'members'
            referencedColumns: ['id']
          },
        ]
      }
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          event_date: string
          event_time: string | null
          location: string | null
          description: string | null
          audience: Database['public']['Enums']['audience_type']
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          event_date: string
          event_time?: string | null
          location?: string | null
          description?: string | null
          audience?: Database['public']['Enums']['audience_type']
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          event_date?: string
          event_time?: string | null
          location?: string | null
          description?: string | null
          audience?: Database['public']['Enums']['audience_type']
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      follow_up_cases: {
        Row: {
          id: string
          member_id: string
          report_id: string
          company_id: string
          assigned_to: string | null
          assigned_by: string | null
          status: Database['public']['Enums']['follow_up_status']
          urgency: Database['public']['Enums']['urgency_level']
          escalated: boolean
          context_note: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          report_id: string
          company_id: string
          assigned_to?: string | null
          assigned_by?: string | null
          status?: Database['public']['Enums']['follow_up_status']
          urgency?: Database['public']['Enums']['urgency_level']
          escalated?: boolean
          context_note?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          report_id?: string
          company_id?: string
          assigned_to?: string | null
          assigned_by?: string | null
          status?: Database['public']['Enums']['follow_up_status']
          urgency?: Database['public']['Enums']['urgency_level']
          escalated?: boolean
          context_note?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follow_up_cases_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_cases_report_id_fkey'
            columns: ['report_id']
            isOneToOne: false
            referencedRelation: 'weekly_reports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_cases_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_cases_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_cases_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      follow_up_contacts: {
        Row: {
          id: string
          case_id: string
          recorded_by: string
          method: Database['public']['Enums']['contact_method']
          note: string | null
          contacted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          recorded_by: string
          method: Database['public']['Enums']['contact_method']
          note?: string | null
          contacted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          recorded_by?: string
          method?: Database['public']['Enums']['contact_method']
          note?: string | null
          contacted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follow_up_contacts_case_id_fkey'
            columns: ['case_id']
            isOneToOne: false
            referencedRelation: 'follow_up_cases'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follow_up_contacts_recorded_by_fkey'
            columns: ['recorded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      members: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          company_id: string
          status: Database['public']['Enums']['member_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          company_id: string
          status?: Database['public']['Enums']['member_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          company_id?: string
          status?: Database['public']['Enums']['member_status']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'members_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          role: Database['public']['Enums']['user_role']
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: Database['public']['Enums']['user_role']
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: Database['public']['Enums']['user_role']
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          created_by: string
          assigned_to: string | null
          company_id: string | null
          due_date: string | null
          status: Database['public']['Enums']['task_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          created_by: string
          assigned_to?: string | null
          company_id?: string | null
          due_date?: string | null
          status?: Database['public']['Enums']['task_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          created_by?: string
          assigned_to?: string | null
          company_id?: string | null
          due_date?: string | null
          status?: Database['public']['Enums']['task_status']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      weekly_reports: {
        Row: {
          id: string
          company_id: string
          submitted_by: string
          week_start: string
          week_number: number
          year: number
          status: Database['public']['Enums']['report_status']
          notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          flag_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          submitted_by: string
          week_start: string
          week_number: number
          year: number
          status?: Database['public']['Enums']['report_status']
          notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          flag_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          submitted_by?: string
          week_start?: string
          week_number?: number
          year?: number
          status?: Database['public']['Enums']['report_status']
          notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          flag_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_reports_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'weekly_reports_submitted_by_fkey'
            columns: ['submitted_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'weekly_reports_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      current_week: {
        Row: {
          week_start: string | null
          week_number: number | null
          year: number | null
        }
        Relationships: []
      }
      report_submission_summary: {
        Row: {
          week_start: string | null
          week_number: number | null
          year: number | null
          total_companies: number | null
          submitted_count: number | null
          awaiting_review: number | null
          flagged_count: number | null
          reviewed_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['user_role']
      }
      get_my_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_or_office: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'company_leader' | 'assistant_leader' | 'church_admin' | 'church_office'
      report_status: 'draft' | 'submitted' | 'reviewed' | 'flagged'
      follow_up_status: 'new' | 'assigned' | 'active' | 'resolved'
      urgency_level: 'normal' | 'urgent'
      contact_method: 'called' | 'messaged' | 'visited'
      task_status: 'open' | 'done'
      notice_priority: 'normal' | 'urgent'
      audience_type: 'all' | 'leaders' | 'admins'
      member_status: 'active' | 'inactive'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
