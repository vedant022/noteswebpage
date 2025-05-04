import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Note, NoteFormData } from "@/types/note";
import { useToast } from "@/hooks/use-toast";

export function useNotes(selectedFolderId: string | null, selectedTag: string | null, searchTerm: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", selectedFolderId, selectedTag, searchTerm],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      let query = supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedFolderId) {
        query = query.eq("folder_id", selectedFolderId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map the notes and ensure tags exist (even if null from the database)
      // Also, add is_password_protected based on whether a password exists
      let filteredNotes = (data || []).map(note => {
        // Cast the database response to include all our needed fields
        const typedNote = note as any;
        return {
          ...typedNote,
          folder_id: typedNote.folder_id || null,
          tags: typedNote.tags || [],
          // A note is password protected if it has either the legacy password field or the new hash+salt
          is_password_protected: !!(typedNote.password || typedNote.password_hash)
        } as Note;
      });
      
      // Apply filters
      
      // Filter by tag if selected
      if (selectedTag) {
        filteredNotes = filteredNotes.filter(note => 
          note.tags && note.tags.includes(selectedTag)
        );
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredNotes = filteredNotes.filter(note => 
          note.title.toLowerCase().includes(term) || 
          (note.content && note.content.toLowerCase().includes(term))
        );
      }
      
      return filteredNotes;
    },
  });

  // Extract all unique tags from notes
  const allTags = Array.from(
    new Set(
      notes
        .flatMap((note) => note.tags || [])
        .filter(Boolean)
    )
  );

  const createOrUpdateNote = useMutation({
    mutationFn: async (note: NoteFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      // Prepare note data for database
      const noteData = {
        title: note.title,
        content: note.content,
        photo_url: note.photo_url,
        voice_url: note.voice_url,
        folder_id: note.folder_id,
        tags: note.tags,
        updated_at: new Date().toISOString(),
        password: note.password,
        // Add new password hash and salt fields
        password_hash: note.password_hash,
        password_salt: note.password_salt
      };

      if (note.id) {
        const { error } = await supabase
          .from("notes")
          .update(noteData)
          .eq("id", note.id);

        if (error) throw error;
        return {
          ...note,
          // Note is password protected if it has hash and salt
          is_password_protected: !!(note.password_hash && note.password_salt)
        } as Note;
      } else {
        // Creating a new note - add user_id to the note data
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              ...noteData,
              user_id: session.session.user.id,
            },
          ])
          .select();

        if (error) {
          console.error("Error creating note:", error);
          throw error;
        }

        // Cast the response to access all fields
        const newNote = data[0] as any;
        
        return {
          ...newNote,
          folder_id: newNote.folder_id || null,
          tags: newNote.tags || [],
          is_password_protected: !!(newNote.password_hash && newNote.password_salt)
        } as Note;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Success",
        description: "Note saved successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    notes,
    isLoading,
    allTags,
    createOrUpdateNote,
    deleteNote
  };
}
