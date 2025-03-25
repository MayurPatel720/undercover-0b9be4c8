
import React from 'react';
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import StepsSection from "@/components/StepsSection";
import PrivacySection from "@/components/PrivacySection";
import { Ghost, MessageCircle, Users, Lock, Star, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const features = [
  {
    title: "Masked Posting",
    description: "Share content anonymously with AI-generated secret identities that mask your writing style.",
    icon: Ghost,
  },
  {
    title: "Clue-Based Recognition",
    description: "Friends earn clues about your identity based on shared interests and interactions.",
    icon: Users,
  },
  {
    title: "Whisper Mode",
    description: "Send anonymous messages with limited words that gradually reveal your identity with engagement.",
    icon: MessageCircle,
  },
  {
    title: "Ghost Circles",
    description: "Create private anonymous groups where members get hints about each other over time.",
    icon: Users,
  },
  {
    title: "Unmask Me Challenge",
    description: "Challenge friends to guess your identity through interactive questions and voice clips.",
    icon: Star,
  },
  {
    title: "Fleeting Echoes",
    description: "Posts vanish after 24 hours unless close friends interact with them.",
    icon: Clock,
  },
];

const Index = () => {
  const handleGetStarted = () => {
    toast({
      title: "Coming Soon!",
      description: "Undercover is currently in private beta. Join the waitlist to get early access!",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-secondary text-foreground/80 mb-2 animate-fade-in">
              <Lock className="w-4 h-4 mr-1" />
              <span>Privacy-first social network</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter max-w-3xl animate-slide-up" style={{animationDelay: "0.1s"}}>
              <span className="text-primary">Undercover</span> - The Anonymous Inner Circle
            </h1>
            <p className="text-xl text-foreground/70 max-w-[700px] animate-slide-up" style={{animationDelay: "0.2s"}}>
              Stay anonymous to the world. Recognizable only to your real friends.
              Connect meaningfully without sacrificing privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: "0.3s"}}>
              <Button size="lg" onClick={handleGetStarted}>
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
            <div className="relative w-full max-w-4xl mt-8 md:mt-16 animate-scale-in rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/30 rounded-2xl flex items-center justify-center">
                <Ghost className="w-24 h-24 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Key Features</h2>
            <p className="text-foreground/70 max-w-[700px]">
              Experience social media in a completely new way with these privacy-focused features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <StepsSection />

      {/* Privacy Section */}
      <PrivacySection />

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-[800px] mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Ready to experience true social privacy?</h2>
            <p className="text-foreground/70">
              Join the waitlist to get early access to Undercover and be among the first to experience a truly private social network.
            </p>
            <Button size="lg" onClick={handleGetStarted}>
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-12 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Ghost className="w-6 h-6 text-primary" />
              <span className="font-bold">Undercover</span>
            </div>
            <p className="text-sm text-foreground/70">
              © {new Date().getFullYear()} Undercover. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
