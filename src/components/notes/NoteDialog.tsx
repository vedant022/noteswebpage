import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "./RichTextEditor";
import { PhotoUpload } from "./PhotoUpload";
import { VoiceRecorder } from "./VoiceRecorder";
import { TagInput } from "./TagInput";
import { FolderType } from "../folders/FolderList";
import { Note } from "@/types/note";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  passwordValidation: string | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPhotoUrlChange: (url: string | null) => void;
  onVoiceUrlChange: (url: string | null) => void;
  onFolderIdChange: (folderId: string | null) => void;
  onTagsChange: (tags: string[]) => void;
  onPasswordChange: (password: string | null) => void;
  onPasswordProtectedChange: (isProtected: boolean) => void;
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
  passwordValidation,
  onTitleChange,
  onContentChange,
  onPhotoUrlChange,
  onVoiceUrlChange,
  onFolderIdChange,
  onTagsChange,
  onPasswordChange,
  onPasswordProtectedChange,
  onSave,
  onClose,
}: NoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>
        
        {/* Form inputs */}
        <div className="space-y-4">
          {/* Title input */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={noteTitle} 
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Note title"
            />
          </div>
          
          {/* Content textarea/rich text editor */}
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor 
              id="content"
              content={noteContent} 
              onChange={onContentChange} 
            />
          </div>
          
          {/* Folder selector */}
          <div className="grid gap-2">
            <Label htmlFor="folder">Folder</Label>
            <select
              id="folder"
              value={noteFolderId || ""}
              onChange={(e) => onFolderIdChange(e.target.value || null)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags input */}
          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagInput tags={noteTags || []} onChange={onTagsChange} />
          </div>
          
          {/* Photo upload */}
          <div className="grid gap-2">
            <Label>Photo</Label>
            <PhotoUpload photoUrl={notePhotoUrl} onPhotoChange={onPhotoUrlChange} />
          </div>
          
          {/* Voice recorder */}
          <div className="grid gap-2">
            <Label>Voice Recording</Label>
            <VoiceRecorder voiceUrl={noteVoiceUrl} onVoiceChange={onVoiceUrlChange} />
          </div>
          
          {/* Password protection toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="password-protection">Password Protection</Label>
            <Switch 
              id="password-protection"
              checked={isPasswordProtected} 
              onCheckedChange={onPasswordProtectedChange}
            />
          </div>
          
          {/* Password input (conditionally shown) */}
          {isPasswordProtected && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password || ""} 
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter password"
              />
              
              {/* Password validation message */}
              {passwordValidation && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertDescription>{passwordValidation}</AlertDescription>
                </Alert>
              )}
              
              {!passwordValidation && (
                <p className="text-xs text-muted-foreground">
                  Strong passwords include uppercase, lowercase, numbers, and special characters
                </p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
