
import { Note } from "@/types/note";
import { useToast } from "@/hooks/use-toast";

export function usePasswordVerification() {
  const { toast } = useToast();

  // Simple password verification function
  const verifyNotePassword = (note: Note, password: string) => {
    // In a real app, you'd use hashing and more secure methods
    return password === note.password;
  };

  const checkNoteAccess = (note: Note): boolean => {
    if (note.is_password_protected) {
      const password = prompt("This note is password protected. Please enter the password:");
      if (!password || !verifyNotePassword(note, password)) {
        toast({
          title: "Access Denied",
          description: "Incorrect password for this note",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  return { verifyNotePassword, checkNoteAccess };
}
