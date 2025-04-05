
import React, { useState, useEffect } from 'react';
import StoryCircle from './StoryCircle';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';

interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  username: string;
  avatar_url: string;
  viewed: boolean;
}

const StoriesRow = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // For demonstration purposes, we'll create some mock stories
    // In a real app, you would fetch these from supabase
    const generateMockStories = () => {
      const now = new Date();
      const mockStories: Story[] = [
        { 
          id: 'your-story',
          user_id: user?.id || 'user-1',
          image_url: 'https://source.unsplash.com/random/300x600/?selfie,1',
          created_at: new Date().toISOString(),
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          username: user?.user_metadata?.anonymous_username || generateRandomUsername(),
          avatar_url: user ? getAvatarUrl(user.user_metadata?.anonymous_username || user.email || 'user') : 'https://source.unsplash.com/random/100x100/?portrait,1',
          viewed: false
        }
      ];

      // Generate random stories
      const userIds = ['user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7'];
      
      for (let i = 0; i < userIds.length; i++) {
        const username = generateRandomUsername();
        const storyCreatedTime = new Date(now.getTime() - Math.random() * 23 * 60 * 60 * 1000); // Random time within last 23 hours
        const expiresAt = new Date(storyCreatedTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from creation
        
        // Only include story if it hasn't expired
        if (expiresAt > now) {
          mockStories.push({
            id: `story-${i + 2}`,
            user_id: userIds[i],
            image_url: `https://source.unsplash.com/random/300x600/?person,${i + 2}`,
            created_at: storyCreatedTime.toISOString(),
            expires_at: expiresAt.toISOString(),
            username: username,
            avatar_url: getAvatarUrl(username),
            viewed: Math.random() > 0.5 // Randomly mark some as viewed
          });
        }
      }
      
      setStories(mockStories);
      setLoading(false);
    };

    generateMockStories();
  }, [user]);

  const checkExpiration = (expiresAt: string): boolean => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    return now < expiration;
  };

  const getTimeLeft = (expiresAt: string): string => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m left`;
    } else {
      return `${diffMinutes}m left`;
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      {loading ? (
        <div className="px-4 py-3 flex space-x-4">
          {[1, 2, 3, 4].map(index => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex px-4 py-3 space-x-1">
          {stories.filter(story => checkExpiration(story.expires_at)).map(story => (
            <div key={story.id} className="relative">
              <StoryCircle 
                avatar={story.avatar_url} 
                name={story.username}
                hasUnseenStory={!story.viewed}
              />
              <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] rounded-full px-1.5 py-0.5">
                {getTimeLeft(story.expires_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoriesRow;
