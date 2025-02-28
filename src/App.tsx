
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

// Create auth context
type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isDeveloperAccess: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Simple protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeveloperAccess, setIsDeveloperAccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsDeveloperAccess(false); // Reset developer access state on reload
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setIsDeveloperAccess(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    // If there's no Supabase session, it means we're using developer access
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsDeveloperAccess(true);
        console.log("Developer access granted");
      }
    });
  };

  const logout = async () => {
    if (isDeveloperAccess) {
      // Just reset the state for developer access
      setIsAuthenticated(false);
      setIsDeveloperAccess(false);
    } else {
      // Normal logout via Supabase
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider value={{ isAuthenticated, isDeveloperAccess, login, logout }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
