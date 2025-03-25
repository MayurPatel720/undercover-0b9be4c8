
import React from 'react';
import { Button } from "@/components/ui/button";
import { Ghost, Shield, Lock, MessageCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Ghost className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">Undercover</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">How It Works</a>
          <a href="#privacy" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Privacy</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:flex">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
