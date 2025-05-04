
import { Note } from "@/types/note";
import { useToast } from "@/hooks/use-toast";
import { createHash } from "crypto-js/core";
import SHA256 from "crypto-js/sha256";
import { enc } from "crypto-js";

export function usePasswordVerification() {
  const { toast } = useToast();

  // Generate a salt (in a real app, you'd store this per note)
  const generateSalt = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Hash the password with a salt
  const hashPassword = (password: string, salt: string) => {
    return SHA256(password + salt).toString(enc.Hex);
  };

  // Validate password strength
  const validatePasswordStrength = (password: string) => {
    const requirements = [];
    let valid = true;

    if (password.length < 8) {
      requirements.push("at least 8 characters");
      valid = false;
    }

    if (!/[A-Z]/.test(password)) {
      requirements.push("an uppercase letter");
      valid = false;
    }

    if (!/[a-z]/.test(password)) {
      requirements.push("a lowercase letter");
      valid = false;
    }

    if (!/[0-9]/.test(password)) {
      requirements.push("a number");
      valid = false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      requirements.push("a special character");
      valid = false;
    }

    let message = "";
    if (!valid) {
      message = `Password should include ${requirements.join(", ")}`;
    }

    return { valid, message };
  };

  // Secure password verification function
  const verifyNotePassword = (note: Note, password: string) => {
    // If note doesn't have a password hash or salt, it's not properly secured
    if (!note.password_hash || !note.password_salt) {
      // Legacy support for notes with plaintext passwords
      if (note.password) {
        return password === note.password;
      }
      return false;
    }

    // Hash the provided password with the stored salt
    const hashedPassword = hashPassword(password, note.password_salt);
    
    // Compare the hashes, not the plaintext passwords
    return hashedPassword === note.password_hash;
  };

  // Prepare a note password for storage (returns hash and salt)
  const prepareNotePassword = (password: string) => {
    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    return { hash, salt };
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

  return { 
    verifyNotePassword, 
    prepareNotePassword, 
    checkNoteAccess,
    validatePasswordStrength
  };
}
