
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src="/lovable-uploads/fccb3afb-a582-41d0-8725-446ba5ee2391.png" 
                alt="Undercover" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">Undercover</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
            <Sparkles className="w-5 h-5" />
          </Button>
          <Button className="w-10 h-10 p-0 rounded-full gradient-primary">
            <User className="w-5 h-5 text-accent" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
