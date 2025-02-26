
import { NoteCard } from "./NoteCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function NotesGrid() {
  const { toast } = useToast();

  // Demo notes data
  const notes = [
    {
      id: 1,
      title: "Welcome Note",
      content: "Welcome to your new notes app! Start by creating a new note.",
    },
    {
      id: 2,
      title: "Getting Started",
      content: "Click the + button to create a new note. You can edit or delete notes using the buttons on each card.",
    },
  ];

  const handleNewNote = () => {
    toast({
      title: "Create New Note",
      description: "This is a demo. Implement actual note creation.",
    });
  };

  const handleEdit = (id: number) => {
    toast({
      title: "Edit Note",
      description: `Editing note ${id}. Implement actual editing.`,
    });
  };

  const handleDelete = (id: number) => {
    toast({
      title: "Delete Note",
      description: `Deleting note ${id}. Implement actual deletion.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Your Notes</h2>
        <Button onClick={handleNewNote}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            onEdit={() => handleEdit(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
