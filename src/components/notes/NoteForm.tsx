
import { useState, useEffect } from "react";
import { NoteDialog } from "./NoteDialog";
import { Note, NoteFormData } from "@/types/note";
import { FolderType } from "../folders/FolderList";
import { useToast } from "@/hooks/use-toast";

interface NoteFormProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  editingNote: Note | null;
  selectedFolderId: string | null;
  folders: FolderType[];
  onSave: (noteData: NoteFormData) => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
}

export function NoteForm({
  open,
  setIsOpen,
  editingNote,
  selectedFolderId,
  folders,
  onSave,
  isCreating,
  setIsCreating
}: NoteFormProps) {
  const { toast } = useToast();
  
  // State for note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePhotoUrl, setNotePhotoUrl] = useState<string | null>(null);
  const [noteVoiceUrl, setNoteVoiceUrl] = useState<string | null>(null);
  const [noteFolderId, setNoteFolderId] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<string[] | null>([]);
  const [notePassword, setNotePassword] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);

  // Set form values when editing note or creating new note
  useEffect(() => {
    if (open) {
      if (editingNote) {
        setNoteTitle(editingNote.title);
        setNoteContent(editingNote.content || "");
        setNotePhotoUrl(editingNote.photo_url);
        setNoteVoiceUrl(editingNote.voice_url);
        setNoteFolderId(editingNote.folder_id);
        setNoteTags(editingNote.tags);
        setIsPasswordProtected(editingNote.is_password_protected || false);
        setNotePassword(editingNote.password || null);
      } else {
        resetNoteForm();
        setNoteFolderId(selectedFolderId);
      }
    }
  }, [open, editingNote, selectedFolderId]);

  const resetNoteForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNotePhotoUrl(null);
    setNoteVoiceUrl(null);
    setNoteFolderId(null);
    setNoteTags([]);
    setNotePassword(null);
    setIsPasswordProtected(false);
  };

  const handleNoteDialogClose = () => {
    resetNoteForm();
    setIsOpen(false);
    setIsCreating(false);
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

    // Validate password if protection is enabled
    if (isPasswordProtected && !notePassword) {
      toast({
        title: "Error",
        description: "Password is required when password protection is enabled",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving note:", {
      id: editingNote?.id,
      title: noteTitle,
      content: noteContent,
      photo_url: notePhotoUrl,
      voice_url: noteVoiceUrl,
      folder_id: noteFolderId,
      tags: noteTags,
      password: isPasswordProtected ? notePassword : null,
    });

    onSave({
      id: editingNote?.id,
      title: noteTitle,
      content: noteContent,
      photo_url: notePhotoUrl,
      voice_url: noteVoiceUrl,
      folder_id: noteFolderId,
      tags: noteTags,
      password: isPasswordProtected ? notePassword : null,
    });
  };

  return (
    <NoteDialog
      open={open}
      onOpenChange={setIsOpen}
      editingNote={editingNote}
      folders={folders}
      noteTitle={noteTitle}
      noteContent={noteContent}
      notePhotoUrl={notePhotoUrl}
      noteVoiceUrl={noteVoiceUrl}
      noteFolderId={noteFolderId}
      noteTags={noteTags}
      isPasswordProtected={isPasswordProtected}
      password={notePassword}
      onTitleChange={setNoteTitle}
      onContentChange={setNoteContent}
      onPhotoUrlChange={setNotePhotoUrl}
      onVoiceUrlChange={setNoteVoiceUrl}
      onFolderIdChange={setNoteFolderId}
      onTagsChange={setNoteTags}
      onPasswordChange={setNotePassword}
      onPasswordProtectedChange={setIsPasswordProtected}
      onSave={handleSaveNote}
      onClose={handleNoteDialogClose}
    />
  );
}
