
import { useState } from "react";
import { NoteCard } from "./NoteCard";
import { PhotoUpload } from "./PhotoUpload";
import { VoiceRecorder } from "./VoiceRecorder";
import { FolderList, FolderType } from "../folders/FolderList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Note = {
  id: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  voice_url: string | null;
  user_id: string;
  folder_id: string | null;
};

export function NotesGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // State for note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePhotoUrl, setNotePhotoUrl] = useState<string | null>(null);
  const [noteVoiceUrl, setNoteVoiceUrl] = useState<string | null>(null);
  const [noteFolderId, setNoteFolderId] = useState<string | null>(null);

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      // We use a more generic approach to work around TypeScript limitations
      const { data, error } = await supabase
        .rpc('get_folders')
        .catch(() => {
          // Fallback if the RPC doesn't exist
          return supabase.from('folders').select('*').order('name', { ascending: true });
        });

      if (error) throw error;
      return data as FolderType[];
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", selectedFolderId],
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
      // We need to ensure the folder_id exists in the returned data
      return (data || []).map(note => ({
        ...note,
        folder_id: note.folder_id || null
      })) as Note[];
    },
  });

  const noteMutation = useMutation({
    mutationFn: async (note: {
      id?: string;
      title: string;
      content: string | null;
      photo_url: string | null;
      voice_url: string | null;
      folder_id: string | null;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      if (note.id) {
        // Update existing note
        const { error } = await supabase
          .from("notes")
          .update({
            title: note.title,
            content: note.content,
            photo_url: note.photo_url,
            voice_url: note.voice_url,
            folder_id: note.folder_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", note.id);

        if (error) throw error;
        return note as Note;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              title: note.title,
              content: note.content,
              photo_url: note.photo_url,
              voice_url: note.voice_url,
              folder_id: note.folder_id,
              user_id: session.session.user.id,
            },
          ])
          .select();

        if (error) throw error;
        return {
          ...data[0],
          folder_id: data[0].folder_id || null
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
    setEditingNote(null);
    setIsCreating(false);
  };

  const handleNoteDialogOpen = (note?: Note) => {
    if (note) {
      // Edit mode
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content || "");
      setNotePhotoUrl(note.photo_url);
      setNoteVoiceUrl(note.voice_url);
      setNoteFolderId(note.folder_id);
    } else {
      // Create mode
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <FolderList
            onSelectFolder={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
          />
        </div>
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {selectedFolderId
                ? `Notes in ${
                    folders.find((f) => f.id === selectedFolderId)?.name ||
                    "Selected Folder"
                  }`
                : "All Notes"}
            </h2>
            <Button onClick={handleNewNote} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title}
                content={note.content || ""}
                photoUrl={note.photo_url}
                voiceUrl={note.voice_url}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note.id)}
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

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Note" : "Create New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Note content"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select
                value={noteFolderId || ""}
                onValueChange={(value) => setNoteFolderId(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              <PhotoUpload 
                photoUrl={notePhotoUrl} 
                onChange={setNotePhotoUrl} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Note</label>
              <VoiceRecorder 
                voiceUrl={noteVoiceUrl} 
                onChange={setNoteVoiceUrl} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleNoteDialogClose}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveNote}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
