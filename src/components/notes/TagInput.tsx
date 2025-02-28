
import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[] | null;
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags = [], onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const currentTags = tags || [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && currentTags.length > 0) {
      // Remove the last tag if backspace is pressed on an empty input
      removeTag(currentTags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    if (
      tag.trim() &&
      !currentTags.some(
        (t) => t.toLowerCase() === tag.trim().toLowerCase()
      )
    ) {
      onChange([...currentTags, tag.trim()]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(currentTags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {currentTags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
          >
            <span>{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-destructive/20 rounded-full"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags (press Enter to add)"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (inputValue.trim()) {
              addTag(inputValue.trim());
            }
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
