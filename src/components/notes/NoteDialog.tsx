
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "./PhotoUpload";
import { VoiceRecorder } from "./VoiceRecorder";
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
import { FolderType } from "../folders/FolderList";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote: Note | null;
  folders: FolderType[];
  noteTitle: string;
  noteContent: string;
  notePhotoUrl: string | null;
  noteVoiceUrl: string | null;
  noteFolderId: string | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPhotoUrlChange: (url: string | null) => void;
  onVoiceUrlChange: (url: string | null) => void;
  onFolderIdChange: (folderId: string | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NoteDialog({
  open,
  onOpenChange,
  editingNote,
  folders,
  noteTitle,
  noteContent,
  notePhotoUrl,
  noteVoiceUrl,
  noteFolderId,
  onTitleChange,
  onContentChange,
  onPhotoUrlChange,
  onVoiceUrlChange,
  onFolderIdChange,
  onSave,
  onClose,
}: NoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Note content"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Folder</label>
            <Select
              value={noteFolderId || ""}
              onValueChange={(value) => onFolderIdChange(value || null)}
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
              onChange={onPhotoUrlChange} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Note</label>
            <VoiceRecorder 
              voiceUrl={noteVoiceUrl} 
              onChange={onVoiceUrlChange} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
