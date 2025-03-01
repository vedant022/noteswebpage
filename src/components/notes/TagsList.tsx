
import { Button } from "@/components/ui/button";

interface TagsListProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagsList({ tags, selectedTag, onTagSelect }: TagsListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tags</h3>
      </div>
      <div className="space-y-1">
        <Button
          variant={selectedTag === null ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onTagSelect(null)}
        >
          All Tags
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTagSelect(tag)}
          >
            #{tag}
          </Button>
        ))}
      </div>
    </div>
  );
}
