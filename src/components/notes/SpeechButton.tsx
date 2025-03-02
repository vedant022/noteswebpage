
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpeechButtonProps {
  text: string;
  title?: string;
}

export function SpeechButton({ text, title }: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  const handleSpeak = () => {
    if (!text) {
      toast({
        title: "Nothing to speak",
        description: "This note has no content to read aloud.",
        variant: "destructive",
      });
      return;
    }

    // Check if the browser supports speech synthesis
    if (!window.speechSynthesis) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create and configure speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Add title as a prefix if provided
    if (title) {
      utterance.text = `${title}. ${text}`;
    }
    
    // Configure voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a good English voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Google') || voice.name.includes('Microsoft')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
    
    // Set other properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Handle events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "An error occurred while speaking the text.",
        variant: "destructive",
      });
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSpeak}
      className={isSpeaking ? "bg-primary text-primary-foreground" : ""}
    >
      {isSpeaking ? (
        <>
          <StopCircle className="w-4 h-4 mr-2" />
          Stop Reading
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 mr-2" />
          Read Aloud
        </>
      )}
    </Button>
  );
}
