
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StoryCircleProps {
  avatar: string;
  name: string;
  hasUnseenStory?: boolean;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ avatar, name, hasUnseenStory = false }) => {
  // Create initials for avatar fallback
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-1 mx-2">
      <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnseenStory ? 'gradient-primary' : 'bg-muted'}`}>
        <Avatar className="w-full h-full border-2 border-background">
          <AvatarImage 
            src={avatar} 
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs truncate w-16 text-center text-foreground">{name}</span>
    </div>
  );
};

export default StoryCircle;
