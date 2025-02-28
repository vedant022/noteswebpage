import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, Trash, Image, Mic, Hash } from "lucide-react";

interface NoteCardProps {
  title: string;
  content: string;
  photoUrl?: string | null;
  voiceUrl?: string | null;
  tags?: string[] | null; 
  onEdit: () => void;
  onDelete: () => void;
  onTagClick?: (tag: string) => void;
}

export function NoteCard({ 
  title, 
  content, 
  photoUrl, 
  voiceUrl, 
  tags = [],
  onEdit, 
  onDelete,
  onTagClick
}: NoteCardProps) {
  const renderContent = () => {
    if (!content) return null;
    
    if (content.includes('<')) {
      return (
        <div 
          className="text-sm text-muted-foreground line-clamp-3 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    }
    
    return <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>;
  };

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
        {renderContent()}
        
        <div className="flex flex-wrap gap-2 pt-2">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => onTagClick && onTagClick(tag)}
                  className="inline-flex items-center text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded-full"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          )}
          
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
