export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string
          error: string | null
          event: string | null
          id: string
          metadata: Json | null
          payload: Json | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string
          error?: string | null
          event?: string | null
          id?: string
          metadata?: Json | null
          payload?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string
          error?: string | null
          event?: string | null
          id?: string
          metadata?: Json | null
          payload?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_roles: {
        Row: {
          role: string | null
          user_id: string
        }
        Insert: {
          role?: string | null
          user_id: string
        }
        Update: {
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          department: Database["public"]["Enums"]["app_role"]
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          department: Database["public"]["Enums"]["app_role"]
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          department?: Database["public"]["Enums"]["app_role"]
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_audit_log: {
        Row: {
          action_type: string
          changed_fields: string[] | null
          citizen_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_at: string
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          changed_fields?: string[] | null
          citizen_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          changed_fields?: string[] | null
          citizen_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_audit_log_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_documents: {
        Row: {
          citizen_id: string
          created_at: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          citizen_id: string
          created_at?: string | null
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          citizen_id?: string
          created_at?: string | null
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_documents_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_properties: {
        Row: {
          citizen_id: string
          created_at: string
          created_by: string | null
          id: string
          property_description: string
          property_details: Json | null
          property_type: string
          registration_number: string | null
          status: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          citizen_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          property_description: string
          property_details?: Json | null
          property_type: string
          registration_number?: string | null
          status?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          citizen_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          property_description?: string
          property_details?: Json | null
          property_type?: string
          registration_number?: string | null
          status?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_properties_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      citizens: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          face_embedding: string | null
          family_name: string | null
          father_name: string | null
          first_name: string | null
          full_name: string
          gender: string | null
          has_vehicle: boolean
          id: string
          last_modified_at: string | null
          last_modified_by: string | null
          latitude: number | null
          longitude: number | null
          national_id: string
          phone: string | null
          photo_url: string | null
          second_name: string | null
          third_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          face_embedding?: string | null
          family_name?: string | null
          father_name?: string | null
          first_name?: string | null
          full_name: string
          gender?: string | null
          has_vehicle?: boolean
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          latitude?: number | null
          longitude?: number | null
          national_id: string
          phone?: string | null
          photo_url?: string | null
          second_name?: string | null
          third_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          face_embedding?: string | null
          family_name?: string | null
          father_name?: string | null
          first_name?: string | null
          full_name?: string
          gender?: string | null
          has_vehicle?: boolean
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          latitude?: number | null
          longitude?: number | null
          national_id?: string
          phone?: string | null
          photo_url?: string | null
          second_name?: string | null
          third_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cybercrime_access: {
        Row: {
          created_at: string
          granted_by: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      cybercrime_cases: {
        Row: {
          assigned_officer_id: string | null
          case_number: string
          case_type: string
          created_at: string
          description: string
          evidence_files: string[] | null
          id: string
          priority: string
          reporter_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_officer_id?: string | null
          case_number: string
          case_type: string
          created_at?: string
          description: string
          evidence_files?: string[] | null
          id?: string
          priority?: string
          reporter_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_officer_id?: string | null
          case_number?: string
          case_type?: string
          created_at?: string
          description?: string
          evidence_files?: string[] | null
          id?: string
          priority?: string
          reporter_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cybercrime_comments: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cybercrime_comments_report_id"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "cybercrime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cybercrime_comments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cybercrime_evidence: {
        Row: {
          case_id: string
          collected_at: string
          collected_by: string
          description: string | null
          evidence_type: string
          file_url: string | null
          id: string
        }
        Insert: {
          case_id: string
          collected_at?: string
          collected_by: string
          description?: string | null
          evidence_type: string
          file_url?: string | null
          id?: string
        }
        Update: {
          case_id?: string
          collected_at?: string
          collected_by?: string
          description?: string | null
          evidence_type?: string
          file_url?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cybercrime_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cybercrime_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cybercrime_followers: {
        Row: {
          created_at: string
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cybercrime_followers_report_id"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "cybercrime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cybercrime_followers_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cybercrime_reports: {
        Row: {
          assigned_to: string | null
          created_at: string
          crime_type: Database["public"]["Enums"]["cybercrime_type"]
          description: string
          evidence_files: string[] | null
          id: string
          platform: string | null
          reporter_id: string
          status: Database["public"]["Enums"]["incident_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          crime_type: Database["public"]["Enums"]["cybercrime_type"]
          description: string
          evidence_files?: string[] | null
          id?: string
          platform?: string | null
          reporter_id: string
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          crime_type?: Database["public"]["Enums"]["cybercrime_type"]
          description?: string
          evidence_files?: string[] | null
          id?: string
          platform?: string | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cybercrime_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cybercrime_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      department_chat_messages: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          message: string
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          message: string
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          message?: string
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      duty_chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          duty_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          duty_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          duty_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_duty_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      education_materials: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string
          file_url: string | null
          id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      face_data: {
        Row: {
          created_at: string
          face_encoding: string
          id: string
          image_url: string | null
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          face_encoding: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          face_encoding?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      face_embeddings: {
        Row: {
          citizen_id: string
          confidence_score: number | null
          created_at: string
          embedding_vector: number[] | null
          extraction_method: string | null
          id: string
          image_url: string | null
          is_primary: boolean | null
        }
        Insert: {
          citizen_id: string
          confidence_score?: number | null
          created_at?: string
          embedding_vector?: number[] | null
          extraction_method?: string | null
          id?: string
          image_url?: string | null
          is_primary?: boolean | null
        }
        Update: {
          citizen_id?: string
          confidence_score?: number | null
          created_at?: string
          embedding_vector?: number[] | null
          extraction_method?: string | null
          id?: string
          image_url?: string | null
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "face_embeddings_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          id: string
          person_id: string
          relation: Database["public"]["Enums"]["family_relation"]
          relative_id: string | null
          relative_name: string
          relative_national_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          person_id: string
          relation: Database["public"]["Enums"]["family_relation"]
          relative_id?: string | null
          relative_name: string
          relative_national_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          person_id?: string
          relation?: Database["public"]["Enums"]["family_relation"]
          relative_id?: string | null
          relative_name?: string
          relative_national_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_relative_id_fkey"
            columns: ["relative_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      forensic_evidence: {
        Row: {
          analysis_date: string | null
          analysis_report: string | null
          analyzed_by: string | null
          case_id: string | null
          chain_of_custody: Json | null
          collected_by: string
          collection_date: string
          created_at: string
          description: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url: string | null
          id: string
          is_verified: boolean | null
          updated_at: string
        }
        Insert: {
          analysis_date?: string | null
          analysis_report?: string | null
          analyzed_by?: string | null
          case_id?: string | null
          chain_of_custody?: Json | null
          collected_by: string
          collection_date?: string
          created_at?: string
          description: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          analysis_date?: string | null
          analysis_report?: string | null
          analyzed_by?: string | null
          case_id?: string | null
          chain_of_custody?: Json | null
          collected_by?: string
          collection_date?: string
          created_at?: string
          description?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forensic_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          incident_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          incident_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          incident_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_files_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          incident_type: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          reporter_id: string
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          incident_type: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          reporter_id: string
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          incident_type?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_news: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          privacy_level: string
          target_groups: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          privacy_level?: string
          target_groups?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          privacy_level?: string
          target_groups?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      investigation_closure_requests: {
        Row: {
          admin_notes: string | null
          citizen_id: string
          created_at: string
          id: string
          reason: string
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          citizen_id: string
          created_at?: string
          id?: string
          reason: string
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          citizen_id?: string
          created_at?: string
          id?: string
          reason?: string
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investigation_closure_requests_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigation_closure_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigation_closure_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investigation_notes: {
        Row: {
          citizen_id: string
          created_at: string
          created_by: string
          id: string
          note_text: string
          updated_at: string
        }
        Insert: {
          citizen_id: string
          created_at?: string
          created_by: string
          id?: string
          note_text: string
          updated_at?: string
        }
        Update: {
          citizen_id?: string
          created_at?: string
          created_by?: string
          id?: string
          note_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investigation_notes_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigation_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investigations: {
        Row: {
          case_id: string | null
          completion_date: string | null
          created_at: string | null
          findings: string | null
          id: string
          investigator_id: string
          next_steps: string | null
          priority: string
          status: string
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          investigator_id: string
          next_steps?: string | null
          priority?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          findings?: string | null
          id?: string
          investigator_id?: string
          next_steps?: string | null
          priority?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cybercrime_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_cases: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          case_number: string
          case_type: string
          created_at: string
          created_by: string
          description: string
          id: string
          national_id: string | null
          notes: string | null
          parties: Json
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          case_number: string
          case_type: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          national_id?: string | null
          notes?: string | null
          parties: Json
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          case_number?: string
          case_type?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          national_id?: string | null
          notes?: string | null
          parties?: Json
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      judicial_documents: {
        Row: {
          case_id: string
          created_at: string
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "judicial_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "judicial_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_messages: {
        Row: {
          attachments: string[] | null
          case_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          sender_department: string
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          case_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          sender_department: string
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          case_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          sender_department?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "judicial_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "judicial_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "judicial_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_transfers: {
        Row: {
          attachments: string[] | null
          case_id: string
          created_at: string
          digital_signature: string | null
          from_department: string
          id: string
          message: string | null
          received_at: string | null
          received_by: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          to_department: string
          transfer_type: string
          transferred_at: string
          transferred_by: string
        }
        Insert: {
          attachments?: string[] | null
          case_id: string
          created_at?: string
          digital_signature?: string | null
          from_department: string
          id?: string
          message?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_department: string
          transfer_type: string
          transferred_at?: string
          transferred_by: string
        }
        Update: {
          attachments?: string[] | null
          case_id?: string
          created_at?: string
          digital_signature?: string | null
          from_department?: string
          id?: string
          message?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_department?: string
          transfer_type?: string
          transferred_at?: string
          transferred_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "judicial_transfers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "judicial_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_reads: {
        Row: {
          id: string
          news_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          news_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          news_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_reads_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "internal_news"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_views: {
        Row: {
          id: string
          notification_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          notification_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_views_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_system_wide: boolean | null
          message: string
          news_id: string | null
          priority: string | null
          recipient_id: string | null
          sender_id: string
          status: Database["public"]["Enums"]["notification_status"]
          target_departments: string[] | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_system_wide?: boolean | null
          message: string
          news_id?: string | null
          priority?: string | null
          recipient_id?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["notification_status"]
          target_departments?: string[] | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_system_wide?: boolean | null
          message?: string
          news_id?: string | null
          priority?: string | null
          recipient_id?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["notification_status"]
          target_departments?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "internal_news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          reason: string | null
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          reason?: string | null
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patrol_members: {
        Row: {
          created_at: string
          id: string
          officer_id: string
          officer_name: string
          officer_phone: string | null
          patrol_id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          officer_id: string
          officer_name: string
          officer_phone?: string | null
          patrol_id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          officer_id?: string
          officer_name?: string
          officer_phone?: string | null
          patrol_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_members_patrol_id_fkey"
            columns: ["patrol_id"]
            isOneToOne: false
            referencedRelation: "patrols"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_tracking: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location_lat: number
          location_lng: number
          officer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_lat: number
          location_lng: number
          officer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_lat?: number
          location_lng?: number
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrol_tracking_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patrols: {
        Row: {
          area: string
          created_at: string
          created_by: string
          department: Database["public"]["Enums"]["app_role"] | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          area: string
          created_at?: string
          created_by: string
          department?: Database["public"]["Enums"]["app_role"] | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string
          department?: Database["public"]["Enums"]["app_role"] | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_comments_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_comments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_likes_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_likes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          privacy_level: string
          target_groups: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          privacy_level?: string
          target_groups?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          privacy_level?: string
          target_groups?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge_number: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          badge_number?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          badge_number?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          date_from: string | null
          date_to: string | null
          file_url: string | null
          generated_at: string
          generated_by: string
          id: string
          report_data: Json
          report_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          file_url?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          report_data: Json
          report_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          report_data?: Json
          report_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessed_at: string | null
          assessed_by: string
          case_id: string | null
          created_at: string | null
          id: string
          impact_analysis: string | null
          mitigation_steps: string | null
          risk_level: string
          risk_score: number | null
          threat_vectors: string[] | null
        }
        Insert: {
          assessed_at?: string | null
          assessed_by: string
          case_id?: string | null
          created_at?: string | null
          id?: string
          impact_analysis?: string | null
          mitigation_steps?: string | null
          risk_level: string
          risk_score?: number | null
          threat_vectors?: string[] | null
        }
        Update: {
          assessed_at?: string | null
          assessed_by?: string
          case_id?: string | null
          created_at?: string | null
          id?: string
          impact_analysis?: string | null
          mitigation_steps?: string | null
          risk_level?: string
          risk_score?: number | null
          threat_vectors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cybercrime_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_active: boolean | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          severity: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      statistics_snapshots: {
        Row: {
          additional_metrics: Json | null
          created_at: string
          id: string
          incidents_by_status: Json | null
          incidents_by_type: Json | null
          snapshot_date: string
          snapshot_type: string
          tasks_by_status: Json | null
          total_incidents: number | null
          total_patrols: number | null
          total_tasks: number | null
          total_violations: number | null
        }
        Insert: {
          additional_metrics?: Json | null
          created_at?: string
          id?: string
          incidents_by_status?: Json | null
          incidents_by_type?: Json | null
          snapshot_date: string
          snapshot_type: string
          tasks_by_status?: Json | null
          total_incidents?: number | null
          total_patrols?: number | null
          total_tasks?: number | null
          total_violations?: number | null
        }
        Update: {
          additional_metrics?: Json | null
          created_at?: string
          id?: string
          incidents_by_status?: Json | null
          incidents_by_type?: Json | null
          snapshot_date?: string
          snapshot_type?: string
          tasks_by_status?: Json | null
          total_incidents?: number | null
          total_patrols?: number | null
          total_tasks?: number | null
          total_violations?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string
          assigned_to: string | null
          created_at: string
          department: Database["public"]["Enums"]["app_role"] | null
          description: string | null
          due_date: string | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_to?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["app_role"] | null
          description?: string | null
          due_date?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["app_role"] | null
          description?: string | null
          due_date?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_users_setup: {
        Row: {
          created_at: string | null
          email: string
          password_hint: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          password_hint?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          password_hint?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      tickets: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          section: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          section: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          section?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      traffic_records: {
        Row: {
          citizen_name: string
          created_at: string
          details: string | null
          id: string
          is_resolved: boolean
          national_id: string
          record_date: string
          record_type: Database["public"]["Enums"]["traffic_record_type"]
          updated_at: string
        }
        Insert: {
          citizen_name: string
          created_at?: string
          details?: string | null
          id?: string
          is_resolved?: boolean
          national_id: string
          record_date: string
          record_type: Database["public"]["Enums"]["traffic_record_type"]
          updated_at?: string
        }
        Update: {
          citizen_name?: string
          created_at?: string
          details?: string | null
          id?: string
          is_resolved?: boolean
          national_id?: string
          record_date?: string
          record_type?: Database["public"]["Enums"]["traffic_record_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_page_permissions: {
        Row: {
          created_at: string
          department: string
          granted_by: string
          id: string
          is_allowed: boolean
          page_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          granted_by: string
          id?: string
          is_allowed?: boolean
          page_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          granted_by?: string
          id?: string
          is_allowed?: boolean
          page_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_owners: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_current_owner: boolean
          national_id: string
          owner_name: string
          ownership_end_date: string | null
          ownership_start_date: string
          phone: string | null
          vehicle_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_current_owner?: boolean
          national_id: string
          owner_name: string
          ownership_end_date?: string | null
          ownership_start_date?: string
          phone?: string | null
          vehicle_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_current_owner?: boolean
          national_id?: string
          owner_name?: string
          ownership_end_date?: string | null
          ownership_start_date?: string
          phone?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_owners_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_registrations: {
        Row: {
          chassis_number: string | null
          color: string
          created_at: string
          engine_number: string | null
          id: string
          model: string
          plate_number: string
          registration_date: string
          status: string
          updated_at: string
          vehicle_type: string
          year: number
        }
        Insert: {
          chassis_number?: string | null
          color: string
          created_at?: string
          engine_number?: string | null
          id?: string
          model: string
          plate_number: string
          registration_date?: string
          status?: string
          updated_at?: string
          vehicle_type: string
          year: number
        }
        Update: {
          chassis_number?: string | null
          color?: string
          created_at?: string
          engine_number?: string | null
          id?: string
          model?: string
          plate_number?: string
          registration_date?: string
          status?: string
          updated_at?: string
          vehicle_type?: string
          year?: number
        }
        Relationships: []
      }
      vehicle_violations: {
        Row: {
          created_at: string
          fine_amount: number | null
          id: string
          location: string | null
          notes: string | null
          officer_id: string | null
          status: string
          vehicle_id: string
          violation_date: string
          violation_type: string
        }
        Insert: {
          created_at?: string
          fine_amount?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          officer_id?: string | null
          status?: string
          vehicle_id: string
          violation_date: string
          violation_type: string
        }
        Update: {
          created_at?: string
          fine_amount?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          officer_id?: string | null
          status?: string
          vehicle_id?: string
          violation_date?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_violations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          id: string
          owner_id: string
          plate_number: string
          purchase_date: string | null
          vehicle_type: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          owner_id: string
          plate_number: string
          purchase_date?: string | null
          vehicle_type?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          plate_number?: string
          purchase_date?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      wanted_persons: {
        Row: {
          citizen_id: string
          created_at: string
          id: string
          is_active: boolean
          monitor_end_date: string | null
          monitor_start_date: string
          reason: string | null
        }
        Insert: {
          citizen_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          monitor_end_date?: string | null
          monitor_start_date?: string
          reason?: string | null
        }
        Update: {
          citizen_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          monitor_end_date?: string | null
          monitor_start_date?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wanted_persons_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_test_user_role: {
        Args: {
          user_email: string
          user_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_cybercrime_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_page_permission: {
        Args: { _page_path: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_role: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_activity_error: {
        Args: {
          p_error: string
          p_event: string
          p_payload: Json
          p_source: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "traffic_police"
        | "cid"
        | "special_police"
        | "cybercrime"
        | "officer"
        | "user"
        | "traffic_manager"
        | "cid_manager"
        | "special_manager"
        | "cybercrime_manager"
        | "judicial_police"
      case_status:
        | "open"
        | "under_investigation"
        | "sent_to_court"
        | "sent_to_prosecution"
        | "closed"
      cybercrime_type:
        | "phishing"
        | "fraud"
        | "harassment"
        | "identity_theft"
        | "other"
      evidence_type:
        | "dna"
        | "fingerprint"
        | "photo"
        | "document"
        | "video"
        | "audio"
        | "other"
      family_relation:
        | "father"
        | "mother"
        | "spouse"
        | "brother"
        | "sister"
        | "son"
        | "daughter"
      incident_status: "new" | "in_progress" | "resolved"
      judicial_role:
        | "judicial_police"
        | "court"
        | "prosecution"
        | "forensic_lab"
      notification_status: "unread" | "read"
      task_status: "pending" | "completed" | "in_progress"
      traffic_record_type: "violation" | "case"
      transfer_status: "pending" | "received" | "reviewed" | "completed"
      user_role:
        | "admin"
        | "traffic_police"
        | "cid"
        | "special_police"
        | "cybercrime"
        | "officer"
        | "user"
        | "judicial_police"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "traffic_police",
        "cid",
        "special_police",
        "cybercrime",
        "officer",
        "user",
        "traffic_manager",
        "cid_manager",
        "special_manager",
        "cybercrime_manager",
        "judicial_police",
      ],
      case_status: [
        "open",
        "under_investigation",
        "sent_to_court",
        "sent_to_prosecution",
        "closed",
      ],
      cybercrime_type: [
        "phishing",
        "fraud",
        "harassment",
        "identity_theft",
        "other",
      ],
      evidence_type: [
        "dna",
        "fingerprint",
        "photo",
        "document",
        "video",
        "audio",
        "other",
      ],
      family_relation: [
        "father",
        "mother",
        "spouse",
        "brother",
        "sister",
        "son",
        "daughter",
      ],
      incident_status: ["new", "in_progress", "resolved"],
      judicial_role: [
        "judicial_police",
        "court",
        "prosecution",
        "forensic_lab",
      ],
      notification_status: ["unread", "read"],
      task_status: ["pending", "completed", "in_progress"],
      traffic_record_type: ["violation", "case"],
      transfer_status: ["pending", "received", "reviewed", "completed"],
      user_role: [
        "admin",
        "traffic_police",
        "cid",
        "special_police",
        "cybercrime",
        "officer",
        "user",
        "judicial_police",
      ],
    },
  },
} as const
