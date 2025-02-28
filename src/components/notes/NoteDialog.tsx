
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoUpload } from "./PhotoUpload";
import { VoiceRecorder } from "./VoiceRecorder";
import { RichTextEditor } from "./RichTextEditor";
import { TagInput } from "./TagInput";
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
import { Lock } from "lucide-react";

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
  noteTags: string[] | null;
  isPasswordProtected: boolean;
  password: string | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPhotoUrlChange: (url: string | null) => void;
  onVoiceUrlChange: (url: string | null) => void;
  onFolderIdChange: (folderId: string | null) => void;
  onTagsChange: (tags: string[]) => void;
  onPasswordProtectedChange: (isProtected: boolean) => void;
  onPasswordChange: (password: string | null) => void;
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
  noteTags,
  isPasswordProtected,
  password,
  onTitleChange,
  onContentChange,
  onPhotoUrlChange,
  onVoiceUrlChange,
  onFolderIdChange,
  onTagsChange,
  onPasswordProtectedChange,
  onPasswordChange,
  onSave,
  onClose,
}: NoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            <RichTextEditor
              content={noteContent}
              onChange={onContentChange}
              placeholder="Write your note here..."
            />
            <div className="text-xs text-muted-foreground">
              Supports Markdown syntax and rich text formatting
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput tags={noteTags} onChange={onTagsChange} />
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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="password-protected" 
                checked={isPasswordProtected}
                onCheckedChange={(checked) => onPasswordProtectedChange(checked === true)}
              />
              <label 
                htmlFor="password-protected" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <Lock className="h-4 w-4 mr-1" />
                Password Protected
              </label>
            </div>
            {isPasswordProtected && (
              <Input
                type="password"
                placeholder="Enter password"
                value={password || ""}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            )}
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
