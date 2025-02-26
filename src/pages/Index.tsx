
import { AuthForm } from "@/components/auth/AuthForm";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { useState } from "react";

const Index = () => {
  const [isAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container py-10">
        {isAuthenticated ? (
          <NotesGrid />
        ) : (
          <div className="flex min-h-[80vh] flex-col items-center justify-center">
            <AuthForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
