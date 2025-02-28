
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FolderType } from "../folders/FolderList";
import { SearchNotesInput } from "./SearchNotesInput";

interface NotesHeaderProps {
  selectedFolderId: string | null;
  folders: FolderType[];
  isCreating: boolean;
  onNewNote: () => void;
  onSearch: (searchTerm: string) => void;
}

export function NotesHeader({ 
  selectedFolderId, 
  folders, 
  isCreating, 
  onNewNote,
  onSearch
}: NotesHeaderProps) {
  return (
    <div className="space-y-4">
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
      <SearchNotesInput onSearch={onSearch} />
    </div>
  );
}
