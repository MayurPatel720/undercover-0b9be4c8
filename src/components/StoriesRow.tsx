
import React, { useState, useEffect } from 'react';
import StoryCircle from './StoryCircle';
import CreateStory from './CreateStory';
import StoryViewer from './StoryViewer';
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
  const [viewingStory, setViewingStory] = useState<{
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
  } | null>(null);
  const { user } = useAuth();

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Get current timestamp
      const now = new Date();
      
      // Fetch all stories that haven't expired
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          image_url,
          created_at,
          expires_at,
          profiles:user_id (username, avatar_url)
        `)
        .gte('expires_at', now.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format stories data
      const formattedStories: Story[] = [];
      
      if (storiesData) {
        for (const story of storiesData) {
          // Get profile info
          const profile = story.profiles;
          const username = profile?.username || generateRandomUsername();
          const avatarUrl = profile?.avatar_url || getAvatarUrl(username);
          
          formattedStories.push({
            id: story.id,
            user_id: story.user_id,
            image_url: story.image_url,
            created_at: story.created_at,
            expires_at: story.expires_at,
            username: username,
            avatar_url: avatarUrl,
            viewed: false // In a real app, we'd track this based on the current user
          });
        }
      }
      
      setStories(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    
    // Set up real-time subscription for new stories
    const channel = supabase
      .channel('public:stories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, () => {
        fetchStories();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Group stories by user_id
  const storiesByUser = stories.reduce<Record<string, Story[]>>((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {});

  // Get unique users with their latest story
  const uniqueUserStories = Object.values(storiesByUser).map(userStories => {
    // Sort by created_at to get the latest story first
    userStories.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return userStories[0];
  });

  const handleStoryClick = (story: Story) => {
    setViewingStory({
      id: story.id,
      userId: story.user_id,
      username: story.username,
      avatarUrl: story.avatar_url
    });
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
          <CreateStory onStoryCreated={fetchStories} />
          
          {uniqueUserStories.map(story => (
            <div 
              key={story.id} 
              className="relative cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              <StoryCircle 
                avatar={story.avatar_url} 
                name={story.username}
                hasUnseenStory={!story.viewed}
              />
            </div>
          ))}
        </div>
      )}
      
      {viewingStory && (
        <StoryViewer
          isOpen={!!viewingStory}
          onClose={() => setViewingStory(null)}
          initialStoryId={viewingStory.id}
          userId={viewingStory.userId}
          username={viewingStory.username}
          avatarUrl={viewingStory.avatarUrl}
        />
      )}
    </div>
  );
};

export default StoriesRow;
