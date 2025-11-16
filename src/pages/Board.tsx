import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Step {
  id: string;
  text: string;
  duration: number;
}

interface LessonData {
  title: string;
  steps: Step[];
  summary: string;
}

const Board = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState([80]);
  
  const question = location.state?.question || "No question provided";
  const lessonData = location.state?.lessonData as LessonData | undefined;
  const steps = lessonData?.steps || [];
  const title = lessonData?.title || "Lecture Board";

  useEffect(() => {
    if (!lessonData) {
      toast.error("No lesson data available");
      navigate("/");
    }
  }, [lessonData, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lessonData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Demo drawing - will be replaced with AI-generated content
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 + 100);
  }, [lessonData, title]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success("Playback started");
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    toast.info(`Jumped to step ${index + 1}`);
  };

  if (!lessonData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Question & Steps */}
          <Card className="lg:col-span-1 p-6 space-y-6 h-fit">
            <div>
              <h3 className="font-semibold mb-2 text-primary">Question</h3>
              <p className="text-sm text-muted-foreground">{question}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Steps</h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="font-medium text-sm">Step {index + 1}</div>
                    <div className="text-xs opacity-90 mt-1">{step.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Center - Canvas Board */}
          <Card className="lg:col-span-2 p-6">
            <canvas
              ref={canvasRef}
              className="w-full h-[500px] bg-board-bg rounded-lg border-2 border-board-border"
            />

            {/* Playback Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="h-14 w-14 rounded-full bg-gradient-primary"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {volume[0]}%
                </span>
              </div>
            </div>
          </Card>

          {/* Right Sidebar - Transcript */}
          <Card className="lg:col-span-1 p-6">
            <h3 className="font-semibold mb-4">Transcript</h3>
            <div className="space-y-4 text-sm">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg transition-colors ${
                    currentStep === index
                      ? "bg-primary/10 border-l-4 border-primary"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="font-medium text-xs text-primary mb-1">
                    Step {index + 1}
                  </div>
                  <div className="text-muted-foreground">{step.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Board;
