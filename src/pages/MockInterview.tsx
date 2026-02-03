import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase, Question } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Square,
  Clock,
  ChevronRight,
  Award,
  Target,
  RotateCcw,
  Settings,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function MockInterview() {
  const { user } = useAuth();
  const [stage, setStage] = useState<"setup" | "interview" | "complete">("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["hr", "technical", "behavioral"]);
  const [questionCount, setQuestionCount] = useState(5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTotalTime((prev) => prev + 1);
        setQuestionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true);

    if (error) {
      toast.error("Failed to load questions");
    } else {
      setQuestions(data as Question[] || []);
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoEnabled, 
        audio: audioEnabled 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Could not access camera/microphone");
      setVideoEnabled(false);
      setAudioEnabled(false);
    }
  };

  const startInterview = async () => {
    // Filter and shuffle questions based on settings
    const filteredQuestions = questions.filter(q => 
      selectedCategories.includes(q.category)
    );
    
    // Shuffle and limit
    const shuffled = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    
    if (shuffled.length === 0) {
      toast.error("No questions available for selected categories");
      return;
    }

    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(""));
    
    if (videoEnabled || audioEnabled) {
      await setupCamera();
    }
    
    setStage("interview");
    setIsTimerActive(true);
  };

  const nextQuestion = () => {
    // Save current answer
    const newAnswers = [...answers];
    newAnswers[currentIndex] = currentAnswer;
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer(answers[currentIndex + 1] || "");
      setQuestionTime(0);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    setIsTimerActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Save final answer
    const newAnswers = [...answers];
    newAnswers[currentIndex] = currentAnswer;
    setAnswers(newAnswers);
    
    setStage("complete");
    toast.success("Interview completed!");
  };

  const resetInterview = () => {
    setStage("setup");
    setCurrentIndex(0);
    setTotalTime(0);
    setQuestionTime(0);
    setAnswers([]);
    setCurrentAnswer("");
    fetchQuestions();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Setup Stage */}
          {stage === "setup" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">Mock Interview</h1>
                <p className="text-muted-foreground">
                  Simulate a real interview experience with timed questions
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Interview Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Question Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "hr", label: "HR", color: "bg-primary" },
                        { id: "technical", label: "Technical", color: "bg-accent" },
                        { id: "behavioral", label: "Behavioral", color: "bg-success" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(cat.id)
                                ? prev.filter((c) => c !== cat.id)
                                : [...prev, cat.id]
                            );
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedCategories.includes(cat.id)
                              ? `${cat.color} text-primary-foreground`
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {selectedCategories.includes(cat.id) && (
                            <Check className="w-4 h-4 inline mr-1" />
                          )}
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Number of Questions
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionCount(count)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            questionCount === count
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Controls */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Recording Options
                    </label>
                    <div className="flex gap-3">
                      <Button
                        variant={videoEnabled ? "default" : "outline"}
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className="gap-2"
                      >
                        {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        Video {videoEnabled ? "On" : "Off"}
                      </Button>
                      <Button
                        variant={audioEnabled ? "default" : "outline"}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className="gap-2"
                      >
                        {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        Audio {audioEnabled ? "On" : "Off"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enable camera and microphone for a more realistic experience
                    </p>
                  </div>

                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="w-full gap-2"
                    onClick={startInterview}
                    disabled={selectedCategories.length === 0}
                  >
                    <Play className="w-5 h-5" />
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interview Stage */}
          {stage === "interview" && currentQuestion && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Panel */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-4">
                    {videoEnabled ? (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <button 
                            onClick={() => setVideoEnabled(false)}
                            className="p-2 rounded-full bg-foreground/20 backdrop-blur-sm hover:bg-foreground/30 transition-colors"
                          >
                            <Video className="w-4 h-4 text-primary-foreground" />
                          </button>
                          <button 
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className="p-2 rounded-full bg-foreground/20 backdrop-blur-sm hover:bg-foreground/30 transition-colors"
                          >
                            {audioEnabled ? (
                              <Mic className="w-4 h-4 text-primary-foreground" />
                            ) : (
                              <MicOff className="w-4 h-4 text-primary-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                        <VideoOff className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Timer Display */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">Question Time</span>
                        <span className="font-display font-bold text-lg">
                          {formatTime(questionTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <span className="text-sm text-primary">Total Time</span>
                        <span className="font-display font-bold text-lg text-primary">
                          {formatTime(totalTime)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      variant="destructive" 
                      className="w-full mt-4 gap-2"
                      onClick={endInterview}
                    >
                      <Square className="w-4 h-4" />
                      End Interview
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Question Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">
                        {currentQuestion.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          currentQuestion.difficulty === "easy" 
                            ? "border-success text-success" 
                            : currentQuestion.difficulty === "medium"
                              ? "border-warning text-warning"
                              : "border-destructive text-destructive"
                        }
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                      {currentQuestion.time_limit_seconds && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(currentQuestion.time_limit_seconds / 60)}m suggested
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <h2 className="text-2xl font-display font-semibold">
                      {currentQuestion.question_text}
                    </h2>

                    <Textarea
                      placeholder="Type your response here... Think about structure, examples, and clarity."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="min-h-[200px] text-base"
                    />

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        {currentIndex < questions.length - 1 
                          ? "Answer and click Next to continue"
                          : "This is the last question"
                        }
                      </p>
                      <Button 
                        variant="hero" 
                        onClick={nextQuestion}
                        className="gap-2"
                      >
                        {currentIndex < questions.length - 1 ? (
                          <>
                            Next Question
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Finish Interview
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Complete Stage */}
          {stage === "complete" && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-success flex items-center justify-center mx-auto mb-8">
                <Award className="w-12 h-12 text-success-foreground" />
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-4">
                Interview Complete! 🎉
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Great job completing your mock interview!
              </p>

              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-display font-bold text-primary mb-1">
                        {questions.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-display font-bold text-accent mb-1">
                        {formatTime(totalTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-display font-bold text-success mb-1">
                        {Math.round(totalTime / questions.length)}s
                      </div>
                      <div className="text-sm text-muted-foreground">Avg per Question</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answers Review */}
              <Card className="text-left mb-8">
                <CardHeader>
                  <CardTitle>Your Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-medium">{q.question_text}</p>
                      </div>
                      <p className="ml-9 text-muted-foreground text-sm">
                        {answers[idx] || <em>No answer provided</em>}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={resetInterview} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Start New Interview
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
