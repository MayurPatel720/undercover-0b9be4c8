
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import Notifications from './Notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/95 border-b border-border backdrop-blur-sm">
      <div className="flex justify-between items-center h-14 px-4 max-w-screen-xl mx-auto">
        <Link to="/" className="flex items-center font-semibold">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Undercover</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Notifications />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url || getAvatarUrl(generateRandomUsername())} alt={user.user_metadata?.username || 'Avatar'} />
                  <AvatarFallback>{user.user_metadata?.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
