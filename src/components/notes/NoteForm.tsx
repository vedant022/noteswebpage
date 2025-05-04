
import { useState, useEffect } from "react";
import { NoteDialog } from "./NoteDialog";
import { Note, NoteFormData } from "@/types/note";
import { FolderType } from "../folders/FolderList";
import { useToast } from "@/hooks/use-toast";
import { usePasswordVerification } from "@/hooks/usePasswordVerification";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { prepareNotePassword, validatePasswordStrength } = usePasswordVerification();
  
  // State for note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePhotoUrl, setNotePhotoUrl] = useState<string | null>(null);
  const [noteVoiceUrl, setNoteVoiceUrl] = useState<string | null>(null);
  const [noteFolderId, setNoteFolderId] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<string[] | null>([]);
  const [notePassword, setNotePassword] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<string | null>(null);

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
        setPasswordValidation(null);
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
    setPasswordValidation(null);
  };

  const handleNoteDialogClose = () => {
    resetNoteForm();
    setIsOpen(false);
    setIsCreating(false);
  };

  // Handle password change with inline validation feedback
  const handlePasswordChange = (password: string | null) => {
    setNotePassword(password);
    if (password && isPasswordProtected) {
      const validationResult = validatePasswordStrength(password);
      if (!validationResult.valid) {
        setPasswordValidation(validationResult.message);
      } else {
        setPasswordValidation(null);
      }
    } else {
      setPasswordValidation(null);
    }
  };

  const handlePasswordProtectedChange = (isProtected: boolean) => {
    setIsPasswordProtected(isProtected);
    if (isProtected && notePassword) {
      const validationResult = validatePasswordStrength(notePassword);
      if (!validationResult.valid) {
        setPasswordValidation(validationResult.message);
      }
    } else {
      setPasswordValidation(null);
    }
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
    if (isPasswordProtected && notePassword) {
      const validationResult = validatePasswordStrength(notePassword);
      if (!validationResult.valid) {
        setPasswordValidation(validationResult.message);
        return;
      }
    } else if (isPasswordProtected && !notePassword) {
      setPasswordValidation("Password is required when protection is enabled");
      return;
    }

    // Prepare the note data with secure password handling
    let noteData: NoteFormData = {
      id: editingNote?.id,
      title: noteTitle,
      content: noteContent,
      photo_url: notePhotoUrl,
      voice_url: noteVoiceUrl,
      folder_id: noteFolderId,
      tags: noteTags,
      password: null,
      password_hash: null,
      password_salt: null,
    };

    // If password protection is enabled, hash the password
    if (isPasswordProtected && notePassword) {
      // Get hash and salt for the password
      const { hash, salt } = prepareNotePassword(notePassword);
      
      // Store the hash and salt but not the raw password
      noteData.password_hash = hash;
      noteData.password_salt = salt;
      // Legacy password field kept as null for security
      noteData.password = null;
    }

    console.log("Saving note with secure password handling");
    onSave(noteData);
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
      passwordValidation={passwordValidation}
      onTitleChange={setNoteTitle}
      onContentChange={setNoteContent}
      onPhotoUrlChange={setNotePhotoUrl}
      onVoiceUrlChange={setNoteVoiceUrl}
      onFolderIdChange={setNoteFolderId}
      onTagsChange={setNoteTags}
      onPasswordChange={handlePasswordChange}
      onPasswordProtectedChange={handlePasswordProtectedChange}
      onSave={handleSaveNote}
      onClose={handleNoteDialogClose}
    />
  );
}
