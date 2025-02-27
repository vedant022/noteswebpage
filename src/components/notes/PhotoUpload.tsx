
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  photoUrl: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoUpload({ photoUrl, onChange }: PhotoUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("note_attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("note_attachments")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadPhoto(e.target.files[0]);
    }
  };

  const removePhoto = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {photoUrl ? (
        <div className="relative">
          <img
            src={photoUrl}
            alt="Note attachment"
            className="max-h-64 rounded-md object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex">
          <Button
            variant="outline"
            onClick={() => document.getElementById("photo-upload")?.click()}
            disabled={isUploading}
            className="flex items-center"
          >
            <Image className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Photo"}
          </Button>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
