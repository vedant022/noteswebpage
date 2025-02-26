
import { useEffect, useState } from "react";
import { NoteCard } from "./NoteCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Note = {
  id: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  voice_url: string | null;
};

export function NotesGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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

  const handleNewNote = async () => {
    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert([
          { 
            title: 'New Note', 
            content: 'Start writing...',
          }
        ]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Success",
        description: "New note created",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (id: string) => {
    toast({
      title: "Coming soon",
      description: "Note editing will be implemented in the next update",
    });
  };

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Your Notes</h2>
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
            content={note.content || ''}
            onEdit={() => handleEdit(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
