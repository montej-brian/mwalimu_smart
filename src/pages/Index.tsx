import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, BookOpen, Play, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to generate lessons");
      navigate("/auth");
      return;
    }

    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { question },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) {
        console.error("Error generating lesson:", error);
        toast.error("Failed to generate lesson. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!data) {
        toast.error("No response from AI. Please try again.");
        setIsLoading(false);
        return;
      }

      navigate("/board", { state: { lesson: data } });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        {isAuthenticated && (
          <div className="flex justify-end gap-2 mb-4">
            <Button onClick={() => navigate("/lessons")} variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              My Lessons
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 mb-6">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MwalimuSmart
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Your AI-Powered Smart Tutor
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Ask any question and watch as AI breaks it down step-by-step with live illustrations and audio narration
          </p>
        </div>

        {/* Main Question Input */}
        <Card className="max-w-3xl mx-auto p-8 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <div className="space-y-6">
            <div>
              <label htmlFor="question" className="text-sm font-medium mb-2 block">
                What would you like to learn today?
              </label>
              <Textarea
                id="question"
                placeholder="E.g., Explain photosynthesis step by step..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[150px] text-base resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Get Explanation
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="h-12 border-2 hover:bg-muted"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Image
              </Button>
            </div>
          </div>
        </Card>

        {!isAuthenticated && (
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              New to MwalimuSmart?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>
                Sign up
              </Button>
              {" "}or{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>
                sign in
              </Button>
              {" "}to save your lessons
            </p>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Card className="p-6 text-center hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Step-by-Step</h3>
            <p className="text-sm text-muted-foreground">
              Complex concepts broken down into digestible steps
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Live Illustrations</h3>
            <p className="text-sm text-muted-foreground">
              Watch concepts come to life with animated drawings
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Audio Narration</h3>
            <p className="text-sm text-muted-foreground">
              Listen as each step is explained in clear audio
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
