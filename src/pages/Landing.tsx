import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Video,
  MessageSquare,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Question Bank",
    description: "Access hundreds of HR, technical, and behavioral questions curated by industry experts.",
  },
  {
    icon: Video,
    title: "Mock Interviews",
    description: "Practice in realistic interview simulations with timed responses and video recording.",
  },
  {
    icon: MessageSquare,
    title: "Instant Feedback",
    description: "Get AI-powered analysis of your answers with personalized improvement suggestions.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed performance analytics.",
  },
];

const stats = [
  { value: "10K+", label: "Questions" },
  { value: "95%", label: "Success Rate" },
  { value: "50K+", label: "Users" },
  { value: "500+", label: "Companies" },
];

const steps = [
  {
    step: "01",
    title: "Choose Your Focus",
    description: "Select from HR, technical, or behavioral categories based on your needs.",
  },
  {
    step: "02",
    title: "Practice & Record",
    description: "Answer questions with timed sessions and optional video recording.",
  },
  {
    step: "03",
    title: "Get Feedback",
    description: "Receive detailed analysis and tips to improve your responses.",
  },
  {
    step: "04",
    title: "Track Progress",
    description: "Monitor your growth with comprehensive performance metrics.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                AI-Powered Interview Preparation
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Master Your Next
              <span className="block text-gradient-primary">
                Interview
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Practice with real interview questions, get instant feedback, and track your 
              progress. Land your dream job with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group">
                  Start Practicing Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Everything You Need to
              <span className="text-gradient-primary"> Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform gives you all the tools to prepare for any interview.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              How It <span className="text-gradient-accent">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get interview-ready in four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
                    <span className="text-2xl font-display font-bold text-gradient-primary">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join thousands of successful candidates who landed their dream jobs with InterviewPro.
              </p>
              <Link to="/signup">
                <Button variant="accent" size="xl" className="group">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">
                InterviewPro
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 InterviewPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
