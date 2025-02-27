
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container py-10">
        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Notetaking App</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create, store, and manage your notes with our secure and easy-to-use application. Sign in or create an account to get started.
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
