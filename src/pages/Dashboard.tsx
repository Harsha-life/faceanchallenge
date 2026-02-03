import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  Play,
  Users,
  Code,
  MessageSquare,
  ArrowRight,
  Calendar,
  Award
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Mock data for charts (will be replaced with real data)
const mockProgressData = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 72 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 78 },
  { day: "Fri", score: 82 },
  { day: "Sat", score: 85 },
  { day: "Sun", score: 88 },
];

const mockCategoryData = [
  { category: "HR", score: 78, color: "hsl(var(--primary))" },
  { category: "Technical", score: 65, color: "hsl(var(--accent))" },
  { category: "Behavioral", score: 82, color: "hsl(var(--success))" },
];

const practiceCategories = [
  {
    title: "HR Questions",
    description: "Salary, expectations, company fit",
    icon: Users,
    color: "bg-gradient-primary",
    count: 5,
    link: "/practice?category=hr",
  },
  {
    title: "Technical Questions",
    description: "Algorithms, system design, coding",
    icon: Code,
    color: "bg-gradient-accent",
    count: 5,
    link: "/practice?category=technical",
  },
  {
    title: "Behavioral Questions",
    description: "STAR method, soft skills",
    icon: MessageSquare,
    color: "bg-gradient-success",
    count: 5,
    link: "/practice?category=behavioral",
  },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    averageScore: 0,
    streak: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();
    
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    // Fetch real stats from the database
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user?.id);

    if (sessions) {
      const completedSessions = sessions.filter(s => s.completed_at);
      const avgScore = completedSessions.length > 0
        ? completedSessions.reduce((acc, s) => acc + (s.average_score || 0), 0) / completedSessions.length
        : 0;

      setStats({
        totalSessions: sessions.length,
        totalQuestions: sessions.reduce((acc, s) => acc + (s.completed_questions || 0), 0),
        averageScore: Math.round(avgScore),
        streak: 3, // Calculate based on consecutive days
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to sharpen your interview skills today?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <div className="text-3xl font-display font-bold">{stats.totalSessions}</div>
                <p className="text-sm text-muted-foreground">Practice Sessions</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">Answered</span>
                </div>
                <div className="text-3xl font-display font-bold">{stats.totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Questions</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">Average</span>
                </div>
                <div className="text-3xl font-display font-bold">{stats.averageScore}%</div>
                <p className="text-sm text-muted-foreground">Score</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-warning" />
                  </div>
                  <span className="text-sm text-muted-foreground">Current</span>
                </div>
                <div className="text-3xl font-display font-bold">{stats.streak} 🔥</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockProgressData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#scoreGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Target className="w-5 h-5 text-primary" />
                  Category Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockCategoryData.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-sm font-semibold">{cat.score}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cat.score}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Practice Categories */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Start Practicing</h2>
              <Link to="/practice">
                <Button variant="ghost" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {practiceCategories.map((cat) => (
                <Link key={cat.title} to={cat.link}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <cat.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-display font-semibold mb-1">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {cat.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {cat.count} questions
                        </span>
                        <Button variant="ghost" size="sm" className="gap-1 group-hover:gap-2 transition-all">
                          <Play className="w-4 h-4" />
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Mock Interview CTA */}
          <Card className="mt-8 overflow-hidden">
            <div className="relative bg-gradient-hero p-8 md:p-12">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-display font-bold text-primary-foreground mb-2">
                    Ready for a Full Mock Interview?
                  </h3>
                  <p className="text-primary-foreground/80 max-w-lg">
                    Experience a realistic interview simulation with timed questions and comprehensive feedback.
                  </p>
                </div>
                <Link to="/mock-interview">
                  <Button variant="accent" size="lg" className="gap-2 group">
                    <Play className="w-5 h-5" />
                    Start Mock Interview
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
