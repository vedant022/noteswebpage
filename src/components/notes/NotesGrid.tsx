
import { useState } from "react";
import { FolderList } from "../folders/FolderList";
import { useQuery } from "@tanstack/react-query";
import { Note, NoteFormData } from "@/types/note";
import { NotesHeader } from "./NotesHeader";
import { TagsList } from "./TagsList";
import { NotesContainer } from "./NotesContainer";
import { NoteForm } from "./NoteForm";
import { useNotes } from "@/hooks/useNotes";
import { usePasswordVerification } from "@/hooks/usePasswordVerification";
import { supabase } from "@/integrations/supabase/client";

export function NotesGrid() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { checkNoteAccess } = usePasswordVerification();
  
  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_folders');
      if (error) throw error;
      return data;
    },
  });

  const { 
    notes, 
    isLoading, 
    allTags, 
    createOrUpdateNote, 
    deleteNote 
  } = useNotes(selectedFolderId, selectedTag, searchTerm);

  const handleNoteDialogOpen = (note?: Note) => {
    if (note) {
      // Check if note is password protected
      if (!checkNoteAccess(note)) {
        return;
      }
      
      setEditingNote(note);
    } else {
      setEditingNote(null);
      setIsCreating(true);
    }
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = (noteData: NoteFormData) => {
    createOrUpdateNote.mutate(noteData, {
      onSuccess: () => {
        setIsNoteDialogOpen(false);
        setIsCreating(false);
        setEditingNote(null);
      }
    });
  };

  const handleNewNote = () => {
    handleNoteDialogOpen();
  };

  const handleEdit = (note: Note) => {
    handleNoteDialogOpen(note);
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate(id);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
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
          
          <TagsList 
            tags={allTags} 
            selectedTag={selectedTag} 
            onTagSelect={handleTagSelect} 
          />
        </div>
        <div className="md:col-span-3 space-y-4">
          <NotesHeader
            selectedFolderId={selectedFolderId}
            folders={folders}
            isCreating={isCreating}
            onNewNote={handleNewNote}
            onSearch={handleSearch}
          />

          <NotesContainer 
            notes={notes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTagClick={handleTagSelect}
          />
        </div>
      </div>

      <NoteForm
        open={isNoteDialogOpen}
        setIsOpen={setIsNoteDialogOpen}
        editingNote={editingNote}
        selectedFolderId={selectedFolderId}
        folders={folders}
        onSave={handleSaveNote}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
      />
    </div>
  );
}
