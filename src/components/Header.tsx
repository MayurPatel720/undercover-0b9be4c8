
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import Notifications from './Notifications';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/95 border-b border-border backdrop-blur-sm">
      <div className="flex justify-between items-center h-14 px-4 max-w-screen-xl mx-auto">
        <Link to="/" className="flex items-center font-semibold">
          <span className="text-2xl font-bold">Undercover</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          {/* Add Notifications component before the existing profile button */}
          <Notifications />
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || getAvatarUrl(generateRandomUsername())} alt={user.user_metadata?.username || 'Avatar'} />
                <AvatarFallback>{user.user_metadata?.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
