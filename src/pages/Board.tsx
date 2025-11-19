import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateVisual, type VisualInstruction } from "@/services/api.service";

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
  const [visualInstructions, setVisualInstructions] = useState<Map<number, VisualInstruction[]>>(new Map());
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load visual instructions for all steps
  useEffect(() => {
    if (!lessonData || steps.length === 0) return;

    const loadVisuals = async () => {
      setIsLoadingVisuals(true);
      const visualMap = new Map<number, VisualInstruction[]>();

      for (let i = 0; i < steps.length; i++) {
        try {
          const result = await generateVisual(steps[i].text, i + 1);
          visualMap.set(i, result.instructions);
        } catch (error) {
          console.error(`Error loading visuals for step ${i}:`, error);
          visualMap.set(i, []); // Set empty array on error
        }
      }

      setVisualInstructions(visualMap);
      setIsLoadingVisuals(false);
    };

    loadVisuals();
  }, [lessonData]);

  // Draw visuals on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lessonData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw current step visuals
    const instructions = visualInstructions.get(currentStep) || [];

    instructions.forEach((instruction) => {
      ctx.strokeStyle = instruction.color || "#3b82f6";
      ctx.fillStyle = instruction.color || "#3b82f6";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      switch (instruction.type) {
        case "circle":
          if (instruction.x !== undefined && instruction.y !== undefined && instruction.radius !== undefined) {
            ctx.beginPath();
            ctx.arc(instruction.x, instruction.y, instruction.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (instruction.x !== undefined && instruction.y !== undefined &&
            instruction.width !== undefined && instruction.height !== undefined) {
            ctx.strokeRect(instruction.x, instruction.y, instruction.width, instruction.height);
          }
          break;
        case "line":
          if (instruction.x1 !== undefined && instruction.y1 !== undefined &&
            instruction.x2 !== undefined && instruction.y2 !== undefined) {
            ctx.beginPath();
            ctx.moveTo(instruction.x1, instruction.y1);
            ctx.lineTo(instruction.x2, instruction.y2);
            ctx.stroke();
          }
          break;
        case "arrow":
          if (instruction.x1 !== undefined && instruction.y1 !== undefined &&
            instruction.x2 !== undefined && instruction.y2 !== undefined) {
            const headlen = 15;
            const angle = Math.atan2(instruction.y2 - instruction.y1, instruction.x2 - instruction.x1);

            ctx.beginPath();
            ctx.moveTo(instruction.x1, instruction.y1);
            ctx.lineTo(instruction.x2, instruction.y2);
            ctx.lineTo(
              instruction.x2 - headlen * Math.cos(angle - Math.PI / 6),
              instruction.y2 - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(instruction.x2, instruction.y2);
            ctx.lineTo(
              instruction.x2 - headlen * Math.cos(angle + Math.PI / 6),
              instruction.y2 - headlen * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
          break;
        case "text":
          if (instruction.x !== undefined && instruction.y !== undefined && instruction.text) {
            ctx.font = `${instruction.fontSize || 20}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(instruction.text, instruction.x, instruction.y);
          }
          break;
      }
    });

    // Show loading indicator if visuals are still loading
    if (isLoadingVisuals) {
      ctx.fillStyle = "#666";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading visuals...", canvas.width / 2, canvas.height / 2);
    }
  }, [lessonData, currentStep, visualInstructions, isLoadingVisuals, title]);

  // Handle audio narration
  const speakStep = (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[stepIndex];

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.volume = volume[0] / 100;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Move to next step after current step completes
      if (isPlaying && stepIndex < steps.length - 1) {
        playbackTimeoutRef.current = setTimeout(() => {
          setCurrentStep(stepIndex + 1);
        }, 500); // Small pause between steps
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      toast.error("Audio playback error");
      setIsPlaying(false);
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      speakStep(currentStep);
    } else {
      window.speechSynthesis.cancel();
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    }

    return () => {
      window.speechSynthesis.cancel();
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, [isPlaying, currentStep]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success("Playback started");
    } else {
      toast.info("Playback paused");
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
    toast.info(`Jumped to step ${index + 1}`);
  };

  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
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
                    className={`w-full text-left p-3 rounded-lg transition-colors ${currentStep === index
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
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-[500px] bg-board-bg rounded-lg border-2 border-board-border"
              />
              {isLoadingVisuals && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
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
                  onClick={handleNext}
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
                  className={`p-3 rounded-lg transition-colors ${currentStep === index
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
