
import { NoteCard } from "./NoteCard";
import { Note } from "@/types/note";

interface NotesContainerProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function NotesContainer({
  notes,
  onEdit,
  onDelete,
  onTagClick,
}: NotesContainerProps) {
  if (notes.length === 0) {
    return (
      <div className="col-span-full text-center py-10 text-muted-foreground">
        No notes found. Create a new note to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
