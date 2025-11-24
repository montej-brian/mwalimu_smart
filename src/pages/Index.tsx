import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, BookOpen, Play, X } from "lucide-react";
import { toast } from "sonner";
import { generateLesson } from "@/services/api.service";


const Index = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);

    try {
      const data = await generateLesson(question, image);

      if (!data) {
        toast.error("No response from AI. Please try again.");
        setIsLoading(false);
        return;
      }

      navigate("/board", { state: { question, lessonData: data } });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      toast.error("Image size should be less than 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      toast.success("Image selected.");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 mb-6">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MwalimuSmart
            </h1>
          </div>
        </div>

        {/* Main Question Input */}
        <Card className="max-w-3xl mx-auto p-8 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <div className="space-y-6">
            <div>
              <Textarea
                id="question"
                placeholder="E.g., Explain photosynthesis step by step..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[150px] text-base resize-none"
              />
            </div>

            {image && (
              <div className="relative w-fit mx-auto">
                <img
                  src={image}
                  alt="Upload preview"
                  className="max-h-48 rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full"
                  onClick={handleRemoveImage}
                ><X className="h-4 w-4" /></Button>
              </div>
            )}

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
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-12 border-2 hover:bg-muted"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Image
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden" />
          </div>
        </Card>
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
