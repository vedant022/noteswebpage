
export interface Note {
  id: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  voice_url: string | null;
  folder_id: string | null;
  tags: string[] | null;
  password: string | null; // Legacy field - kept for backwards compatibility
  password_hash: string | null; // New field for storing hashed password
  password_salt: string | null; // New field for storing password salt
  is_password_protected: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface NoteFormData {
  id?: string;
  title: string;
  content: string;
  photo_url: string | null;
  voice_url: string | null;
  folder_id: string | null;
  tags: string[] | null;
  password: string | null; // Legacy field - will be phased out
  password_hash?: string | null; // New field for storing hashed password
  password_salt?: string | null; // New field for storing password salt
  is_password_protected?: boolean; // Added to track password protection status
}
