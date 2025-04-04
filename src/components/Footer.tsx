
import React from 'react';
import { Home, Grid, MessageCircle, Sparkles, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-4">
      <button 
        className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-accent' : 'text-muted-foreground'}`}
        onClick={() => navigate('/')}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button className="flex flex-col items-center justify-center text-muted-foreground">
        <Grid className="w-6 h-6" />
        <span className="text-xs mt-1">Discover</span>
      </button>
      
      <div className="flex items-center justify-center -mt-10">
        <div 
          className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg cursor-pointer"
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className="w-7 h-7 text-accent" />
        </div>
      </div>
      
      <button className="flex flex-col items-center justify-center text-muted-foreground">
        <Sparkles className="w-6 h-6" />
        <span className="text-xs mt-1">Trending</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center ${location.pathname === '/profile' ? 'text-accent' : 'text-muted-foreground'}`}
        onClick={() => navigate('/profile')}
      >
        <User className="w-6 h-6" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
};

export default Footer;
