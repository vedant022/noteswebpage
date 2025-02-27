
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, Trash, Image, Mic } from "lucide-react";

interface NoteCardProps {
  title: string;
  content: string;
  photoUrl?: string | null;
  voiceUrl?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ 
  title, 
  content, 
  photoUrl, 
  voiceUrl, 
  onEdit, 
  onDelete 
}: NoteCardProps) {
  return (
    <Card className="w-full h-full transition-all duration-300 hover:shadow-lg animate-fade-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="w-8 h-8"
          >
            <Pen className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="w-8 h-8 text-destructive"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
        
        <div className="flex gap-2 pt-2">
          {photoUrl && (
            <div className="text-muted-foreground">
              <Image className="w-4 h-4 inline-block mr-1" />
              <span className="text-xs">Photo</span>
            </div>
          )}
          
          {voiceUrl && (
            <div className="text-muted-foreground">
              <Mic className="w-4 h-4 inline-block mr-1" />
              <span className="text-xs">Voice</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
