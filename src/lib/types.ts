export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; name: string | null; closet_name: string | null; theme: string }
        Insert: { id: string; email: string; name?: string | null; closet_name?: string | null; theme?: string }
        Update: { email?: string; name?: string | null; closet_name?: string | null; theme?: string }
      }
      members: {
        Row: { user_id: string; is_admin: boolean }
        Insert: { user_id: string; is_admin?: boolean }
        Update: never
      }
      base_locations: {
        Row: { id: string; created_by: string; name: string }
        Insert: { id?: string; created_by?: string; name: string }
        Update: { name?: string }
      }
      storage_locations: {
        Row: { id: string; created_by: string; base_id: string; name: string }
        Insert: { id?: string; created_by?: string; base_id: string; name: string }
        Update: { base_id?: string; name?: string }
      }
      items: {
        Row: {
          id: string
          created_by: string
          name: string
          notes: string | null
          image_url: string | null
          storage_location_id: string | null
          status: string | null
          favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string
          name: string
          notes?: string | null
          image_url?: string | null
          storage_location_id?: string | null
          status?: string | null
          favorite?: boolean
        }
        Update: {
          name?: string
          notes?: string | null
          image_url?: string | null
          storage_location_id?: string | null
          status?: string | null
          favorite?: boolean
          updated_at?: string
        }
      }
      tag_groups: {
        Row: { id: string; created_by: string; name: string; is_system: boolean }
        Insert: { id?: string; created_by?: string; name: string; is_system?: boolean }
        Update: { name?: string }
      }
      tags: {
        Row: { id: string; group_id: string; value: string }
        Insert: { id?: string; group_id: string; value: string }
        Update: { value?: string }
      }
      item_tags: {
        Row: { item_id: string; tag_id: string }
        Insert: { item_id: string; tag_id: string }
        Update: never
      }
      outfit_slots: {
        Row: { id: string; created_by: string; name: string; display_order: number; allow_multiple: boolean }
        Insert: { id?: string; created_by?: string; name: string; display_order?: number; allow_multiple?: boolean }
        Update: { name?: string; display_order?: number; allow_multiple?: boolean }
      }
      outfits: {
        Row: { id: string; created_by: string; name: string }
        Insert: { id?: string; created_by?: string; name: string }
        Update: { name?: string }
      }
      outfit_items: {
        Row: { outfit_id: string; item_id: string; slot_id: string | null }
        Insert: { outfit_id: string; item_id: string; slot_id?: string | null }
        Update: { slot_id?: string | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types for joined queries
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserSettings = { closet_name: string | null; theme: string }
export type BaseLocation = Database['public']['Tables']['base_locations']['Row']
export type OutfitSlot = Database['public']['Tables']['outfit_slots']['Row']
export type StorageLocation = Database['public']['Tables']['storage_locations']['Row'] & {
  base_locations?: BaseLocation
}
export type TagGroup = Database['public']['Tables']['tag_groups']['Row'] & {
  tags?: Tag[]
}
export type Tag = Database['public']['Tables']['tags']['Row']
export type Item = Database['public']['Tables']['items']['Row'] & {
  storage_locations?: StorageLocation | null
  item_tags?: { tags: Tag }[]
}
export type Outfit = Database['public']['Tables']['outfits']['Row'] & {
  outfit_items?: { item_id: string; slot_id: string | null; items: Item }[]
}
