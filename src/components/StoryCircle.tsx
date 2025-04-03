
import React from 'react';

interface StoryCircleProps {
  avatar: string;
  name: string;
  hasUnseenStory?: boolean;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ avatar, name, hasUnseenStory = false }) => {
  return (
    <div className="flex flex-col items-center space-y-1 mx-2">
      <div className={`w-16 h-16 rounded-full p-0.5 ${hasUnseenStory ? 'gradient-primary' : 'bg-muted'}`}>
        <div className="w-full h-full bg-secondary rounded-full overflow-hidden">
          <img 
            src={avatar} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://source.unsplash.com/random/100x100/?face';
            }}
          />
        </div>
      </div>
      <span className="text-xs truncate w-16 text-center">{name}</span>
    </div>
  );
};

export default StoryCircle;
