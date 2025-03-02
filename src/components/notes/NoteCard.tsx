
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Lock, Image, Mic } from "lucide-react";
import { SpeechButton } from "./SpeechButton";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onTagClick }: NoteCardProps) {
  // Format date for display
  const formattedDate = formatDistanceToNow(new Date(note.updated_at), { addSuffix: true });
  
  // Format content preview by removing any HTML tags and limiting length
  const contentPreview = note.content 
    ? note.content.replace(/<[^>]*>/g, '').slice(0, 150) + (note.content.length > 150 ? '...' : '')
    : '';

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold truncate" title={note.title}>
            {note.title}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {note.is_password_protected && (
              <Lock className="h-4 w-4 text-orange-500" title="Password protected" />
            )}
            {note.photo_url && (
              <Image className="h-4 w-4 text-blue-500" title="Has image" />
            )}
            {note.voice_url && (
              <Mic className="h-4 w-4 text-green-500" title="Has voice note" />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground">
          {contentPreview || "No content"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-2 space-y-2">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between w-full mt-2">
          <SpeechButton text={note.content || ""} title={note.title} />
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(note)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
