import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Trash2, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  question: string;
  title: string;
  steps: any[];
  summary: string | null;
  created_at: string;
}

const Lessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAuth();
    fetchLessons();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserEmail(session.user.email || "");
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLessons((data || []).map(lesson => ({
        ...lesson,
        steps: lesson.steps as any[]
      })));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load lessons",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setLessons(lessons.filter(lesson => lesson.id !== id));
      toast({
        title: "Lesson deleted",
        description: "The lesson has been removed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete lesson",
        description: error.message,
      });
    }
  };

  const handleViewLesson = (lesson: Lesson) => {
    navigate("/board", { state: { lesson } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Lessons</h1>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              New Lesson
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No lessons yet. Create your first lesson to get started!
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Create Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {lesson.question}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {lesson.steps.length} steps • {new Date(lesson.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewLesson(lesson)}
                        className="flex-1"
                        variant="default"
                      >
                        View Lesson
                      </Button>
                      <Button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;