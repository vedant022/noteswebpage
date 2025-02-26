
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    // TODO: Replace with actual auth logic
    toast({
      title: "Login successful",
      description: "Redirecting to dashboard...",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container py-10">
        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
