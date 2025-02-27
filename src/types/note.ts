
export type Note = {
  id: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  voice_url: string | null;
  user_id: string;
  folder_id: string | null;
};

export type NoteFormData = {
  id?: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  voice_url: string | null;
  folder_id: string | null;
};
