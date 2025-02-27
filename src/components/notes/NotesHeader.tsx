
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FolderType } from "../folders/FolderList";

interface NotesHeaderProps {
  selectedFolderId: string | null;
  folders: FolderType[];
  isCreating: boolean;
  onNewNote: () => void;
}

export function NotesHeader({ 
  selectedFolderId, 
  folders, 
  isCreating, 
  onNewNote 
}: NotesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-tight">
        {selectedFolderId
          ? `Notes in ${
              folders.find((f) => f.id === selectedFolderId)?.name ||
              "Selected Folder"
            }`
          : "All Notes"}
      </h2>
      <Button onClick={onNewNote} disabled={isCreating}>
        <Plus className="w-4 h-4 mr-2" />
        New Note
      </Button>
    </div>
  );
}
