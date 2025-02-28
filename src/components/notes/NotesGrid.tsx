
import { useState } from "react";
import { NoteCard } from "./NoteCard";
import { FolderList, FolderType } from "../folders/FolderList";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Note, NoteFormData } from "@/types/note";
import { NotesHeader } from "./NotesHeader";
import { NoteDialog } from "./NoteDialog";

export function NotesGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // State for note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePhotoUrl, setNotePhotoUrl] = useState<string | null>(null);
  const [noteVoiceUrl, setNoteVoiceUrl] = useState<string | null>(null);
  const [noteFolderId, setNoteFolderId] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<string[] | null>(null);

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_folders');
      if (error) throw error;
      return data as FolderType[];
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", selectedFolderId, selectedTag],
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
      
      let filteredNotes = (data || []).map(note => ({
        ...note,
        folder_id: note.folder_id || null,
        tags: note.tags || []
      })) as Note[];
      
      // Filter by tag if selected
      if (selectedTag) {
        filteredNotes = filteredNotes.filter(note => 
          note.tags && note.tags.includes(selectedTag)
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

  const noteMutation = useMutation({
    mutationFn: async (note: NoteFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      if (note.id) {
        const { error } = await supabase
          .from("notes")
          .update({
            title: note.title,
            content: note.content,
            photo_url: note.photo_url,
            voice_url: note.voice_url,
            folder_id: note.folder_id,
            tags: note.tags,
            updated_at: new Date().toISOString(),
          })
          .eq("id", note.id);

        if (error) throw error;
        return note as Note;
      } else {
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              title: note.title,
              content: note.content,
              photo_url: note.photo_url,
              voice_url: note.voice_url,
              folder_id: note.folder_id,
              tags: note.tags,
              user_id: session.session.user.id,
            },
          ])
          .select();

        if (error) throw error;
        return {
          ...data[0],
          folder_id: data[0].folder_id || null,
          tags: data[0].tags || null
        } as Note;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      resetNoteForm();
      setIsNoteDialogOpen(false);
      toast({
        title: "Success",
        description: editingNote
          ? "Note updated successfully"
          : "Note created successfully",
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

  const deleteMutation = useMutation({
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

  const resetNoteForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNotePhotoUrl(null);
    setNoteVoiceUrl(null);
    setNoteFolderId(null);
    setNoteTags([]);
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleNoteDialogOpen = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content || "");
      setNotePhotoUrl(note.photo_url);
      setNoteVoiceUrl(note.voice_url);
      setNoteFolderId(note.folder_id);
      setNoteTags(note.tags);
    } else {
      resetNoteForm();
      setNoteFolderId(selectedFolderId);
    }
    setIsNoteDialogOpen(true);
  };

  const handleNoteDialogClose = () => {
    resetNoteForm();
    setIsNoteDialogOpen(false);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    noteMutation.mutate({
      id: editingNote?.id,
      title: noteTitle,
      content: noteContent,
      photo_url: notePhotoUrl,
      voice_url: noteVoiceUrl,
      folder_id: noteFolderId,
      tags: noteTags,
    });
  };

  const handleNewNote = () => {
    handleNoteDialogOpen();
  };

  const handleEdit = (note: Note) => {
    handleNoteDialogOpen(note);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <FolderList
            onSelectFolder={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
          />
          
          {/* Tags list */}
          {allTags.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tags</h3>
              </div>
              <div className="space-y-1">
                <Button
                  variant={selectedTag === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTagSelect(null)}
                >
                  All Tags
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTagSelect(tag)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-3 space-y-4">
          <NotesHeader
            selectedFolderId={selectedFolderId}
            folders={folders}
            isCreating={isCreating}
            onNewNote={handleNewNote}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title}
                content={note.content || ""}
                photoUrl={note.photo_url}
                voiceUrl={note.voice_url}
                tags={note.tags}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note.id)}
                onTagClick={handleTagSelect}
              />
            ))}
            {notes.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No notes found. Create a new note to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        editingNote={editingNote}
        folders={folders}
        noteTitle={noteTitle}
        noteContent={noteContent}
        notePhotoUrl={notePhotoUrl}
        noteVoiceUrl={noteVoiceUrl}
        noteFolderId={noteFolderId}
        noteTags={noteTags}
        onTitleChange={setNoteTitle}
        onContentChange={setNoteContent}
        onPhotoUrlChange={setNotePhotoUrl}
        onVoiceUrlChange={setNoteVoiceUrl}
        onFolderIdChange={setNoteFolderId}
        onTagsChange={setNoteTags}
        onSave={handleSaveNote}
        onClose={handleNoteDialogClose}
      />
    </div>
  );
}
