
import React from 'react';
import { Home, Grid, MessageCircle, Zap, User, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-4">
      <button className="flex flex-col items-center justify-center text-accent">
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button className="flex flex-col items-center justify-center text-muted-foreground">
        <Grid className="w-6 h-6" />
        <span className="text-xs mt-1">Discover</span>
      </button>
      
      <div className="flex items-center justify-center -mt-10">
        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg">
          <MessageCircle className="w-7 h-7 text-accent" />
        </div>
      </div>
      
      <button className="flex flex-col items-center justify-center text-muted-foreground">
        <Sparkles className="w-6 h-6" />
        <span className="text-xs mt-1">Trending</span>
      </button>
      
      <button className="flex flex-col items-center justify-center text-muted-foreground">
        <User className="w-6 h-6" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
};

export default Footer;
