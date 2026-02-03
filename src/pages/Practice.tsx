import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase, Question, QuestionCategory } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Code, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Lightbulb,
  Send,
  Award,
  Timer
} from "lucide-react";
import { toast } from "sonner";

const categoryConfig = {
  hr: {
    label: "HR",
    icon: Users,
    color: "bg-primary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  technical: {
    label: "Technical",
    icon: Code,
    color: "bg-accent",
    bgColor: "bg-accent/10",
    textColor: "text-accent",
  },
  behavioral: {
    label: "Behavioral",
    icon: MessageSquare,
    color: "bg-success",
    bgColor: "bg-success/10",
    textColor: "text-success",
  },
};

const difficultyColors = {
  easy: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  hard: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function Practice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(
    (searchParams.get("category") as QuestionCategory) || null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      toast.info("Time's up! Review your answer.");
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const fetchQuestions = async () => {
    setLoading(true);
    let query = supabase
      .from("questions")
      .select("*")
      .eq("is_active", true);
    
    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error("Failed to load questions");
      console.error(error);
    } else {
      setQuestions(data as Question[] || []);
    }
    setLoading(false);
  };

  const handleCategorySelect = (category: QuestionCategory) => {
    setSelectedCategory(category);
    setSearchParams({ category });
    setSessionStarted(false);
    setCurrentIndex(0);
    setUserAnswer("");
    setShowAnswer(false);
    setCompletedQuestions(new Set());
  };

  const startSession = () => {
    setSessionStarted(true);
    const currentQuestion = questions[currentIndex];
    if (currentQuestion?.time_limit_seconds) {
      setTimeLeft(currentQuestion.time_limit_seconds);
      setIsTimerActive(true);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setShowAnswer(false);
      const nextQuestion = questions[currentIndex + 1];
      if (nextQuestion?.time_limit_seconds) {
        setTimeLeft(nextQuestion.time_limit_seconds);
        setIsTimerActive(true);
      }
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserAnswer("");
      setShowAnswer(false);
      const prevQuestion = questions[currentIndex - 1];
      if (prevQuestion?.time_limit_seconds) {
        setTimeLeft(prevQuestion.time_limit_seconds);
        setIsTimerActive(false);
      }
    }
  };

  const markComplete = () => {
    setCompletedQuestions((prev) => new Set([...prev, currentIndex]));
    setShowAnswer(true);
    setIsTimerActive(false);
    toast.success("Answer saved!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Practice Mode</h1>
            <p className="text-muted-foreground">
              {selectedCategory 
                ? `Practicing ${categoryConfig[selectedCategory].label} questions`
                : "Select a category to begin"
              }
            </p>
          </div>

          {/* Category Selection */}
          {!sessionStarted && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {(Object.keys(categoryConfig) as QuestionCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const catQuestions = questions.filter(q => q.category === cat);
                return (
                  <Card 
                    key={cat}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedCategory === cat 
                        ? "ring-2 ring-primary shadow-lg" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center mb-4`}>
                        <config.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-display font-semibold mb-1">
                        {config.label} Questions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory === cat ? questions.length : catQuestions.length} questions available
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Start Button */}
          {selectedCategory && !sessionStarted && questions.length > 0 && (
            <div className="text-center mb-8">
              <Button variant="hero" size="xl" onClick={startSession}>
                Start Practice Session
              </Button>
            </div>
          )}

          {/* Practice Session */}
          {sessionStarted && currentQuestion && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>

              {/* Timer */}
              {isTimerActive && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                  timeLeft <= 30 ? "bg-destructive/10 text-destructive" : "bg-secondary"
                }`}>
                  <Timer className="w-5 h-5" />
                  <span className="text-2xl font-display font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}

              {/* Question Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={difficultyColors[currentQuestion.difficulty]}>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="secondary" className={categoryConfig[currentQuestion.category].bgColor}>
                        <span className={categoryConfig[currentQuestion.category].textColor}>
                          {categoryConfig[currentQuestion.category].label}
                        </span>
                      </Badge>
                    </div>
                    {currentQuestion.tags && (
                      <div className="hidden md:flex items-center gap-2">
                        {currentQuestion.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h2 className="text-xl font-display font-semibold mb-6">
                    {currentQuestion.question_text}
                  </h2>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[150px] text-base"
                      disabled={completedQuestions.has(currentIndex)}
                    />

                    {!completedQuestions.has(currentIndex) && (
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="hero" 
                          onClick={markComplete}
                          disabled={!userAnswer.trim()}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Answer
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setShowAnswer(true)}
                          className="gap-2"
                        >
                          <Lightbulb className="w-4 h-4" />
                          Show Sample Answer
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Sample Answer */}
                  {showAnswer && currentQuestion.sample_answer && (
                    <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/30">
                      <div className="flex items-center gap-2 mb-2 text-success font-semibold">
                        <Award className="w-5 h-5" />
                        Sample Answer
                      </div>
                      <p className="text-foreground/80">
                        {currentQuestion.sample_answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setUserAnswer("");
                        setShowAnswer(false);
                        setIsTimerActive(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentIndex 
                          ? "bg-primary scale-125" 
                          : completedQuestions.has(idx)
                            ? "bg-success"
                            : "bg-muted hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={nextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Session Complete */}
              {completedQuestions.size === questions.length && (
                <Card className="bg-gradient-success text-success-foreground">
                  <CardContent className="p-8 text-center">
                    <Award className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-bold mb-2">
                      Session Complete! 🎉
                    </h3>
                    <p className="mb-6 opacity-90">
                      You've completed all {questions.length} questions in this session.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="glass" 
                        onClick={() => {
                          setSessionStarted(false);
                          setCurrentIndex(0);
                          setCompletedQuestions(new Set());
                          setUserAnswer("");
                          setShowAnswer(false);
                        }}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Practice Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {selectedCategory && questions.length === 0 && !loading && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No questions available</h3>
                <p className="text-muted-foreground">
                  Questions for this category will be added soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
