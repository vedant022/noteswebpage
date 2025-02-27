
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  voiceUrl: string | null;
  onChange: (url: string | null) => void;
}

export function VoiceRecorder({ voiceUrl, onChange }: VoiceRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        uploadVoiceRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not access microphone: " + error.message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const uploadVoiceRecording = async (audioBlob: Blob) => {
    setIsUploading(true);
    try {
      const fileName = `voice-${Math.random().toString(36).substring(2, 15)}.webm`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("note_attachments")
        .upload(filePath, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("note_attachments")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast({
        title: "Success",
        description: "Voice recording uploaded successfully",
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

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const removeVoiceRecording = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {voiceUrl ? (
        <div className="flex items-center gap-2">
          <audio
            ref={audioPlayerRef}
            src={voiceUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 h-2 bg-secondary rounded-full">
            <div className="h-full w-0 bg-primary rounded-full" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={removeVoiceRecording}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            className="flex items-center"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Record Voice"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
