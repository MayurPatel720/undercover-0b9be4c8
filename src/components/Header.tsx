
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Sparkles, LogOut, LogIn, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  
  const handleOpenAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);

  const NavItems = () => (
    <>
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
        <Search className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
        <Bell className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
        <Sparkles className="w-5 h-5" />
      </Button>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-10 h-10 p-0 rounded-full gradient-primary overflow-hidden">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback className="text-accent">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-white/10">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={handleOpenAuthModal}
          className="gradient-primary rounded-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      )}
    </>
  );

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
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavItems />
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass border-white/10">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/fccb3afb-a582-41d0-8725-446ba5ee2391.png" 
                        alt="Undercover" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gradient">Undercover</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button variant="ghost" className="justify-start rounded-full">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                  <Button variant="ghost" className="justify-start rounded-full">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="justify-start rounded-full">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Discover
                  </Button>
                  
                  {user && (
                    <Button 
                      variant="ghost" 
                      className="justify-start rounded-full"
                      onClick={() => {
                        navigate('/profile');
                      }}
                    >
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </Button>
                  )}
                  
                  {user ? (
                    <Button 
                      variant="ghost" 
                      className="justify-start rounded-full"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign out
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleOpenAuthModal}
                      className="gradient-primary rounded-full w-full justify-center"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />
    </header>
  );
};

export default Header;
