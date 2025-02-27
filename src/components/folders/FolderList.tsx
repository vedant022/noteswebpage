
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Folder, FolderPlus, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export type FolderType = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

interface FolderListProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
}

export function FolderList({ onSelectFolder, selectedFolderId }: FolderListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isFolderListExpanded, setIsFolderListExpanded] = useState(true);

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      // Using a more generic approach to query the folders table
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as FolderType[];
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      // Using a more generic approach to insert into the folders table
      const { data, error } = await supabase
        .from("folders")
        .insert([{ name, user_id: session.session.user.id }])
        .select();

      if (error) throw error;
      return data[0] as FolderType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast({
        title: "Success",
        description: "Folder created successfully",
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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  };

  if (isLoading) {
    return <div>Loading folders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => setIsFolderListExpanded(!isFolderListExpanded)}
        >
          <div className="flex items-center">
            {isFolderListExpanded ? (
              <ChevronDown className="w-5 h-5 mr-1" />
            ) : (
              <ChevronRight className="w-5 h-5 mr-1" />
            )}
            <h3 className="text-lg font-semibold">Folders</h3>
          </div>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingFolder(!isCreatingFolder)}
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {isCreatingFolder && (
        <div className="flex items-center gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1"
          />
          <Button size="sm" onClick={handleCreateFolder}>
            Create
          </Button>
        </div>
      )}

      {isFolderListExpanded && (
        <div className="space-y-1">
          <Button
            variant={selectedFolderId === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectFolder(null)}
          >
            <Folder className="w-4 h-4 mr-2" />
            All Notes
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectFolder(folder.id)}
            >
              <Folder className="w-4 h-4 mr-2" />
              {folder.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
