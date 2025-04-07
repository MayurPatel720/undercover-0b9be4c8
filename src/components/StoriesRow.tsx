
import React, { useState, useEffect } from 'react';
import StoryCircle from './StoryCircle';
import CreateStory from './CreateStory';
import StoryViewer from './StoryViewer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import { Story, StoryWithUser } from '@/lib/database.types';
import { toast } from '@/components/ui/use-toast';

const StoriesRow = () => {
  const [stories, setStories] = useState<StoryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<{
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const { user } = useAuth();

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Get current timestamp
      const now = new Date();
      
      // Direct query instead of using relationships
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .gte('expires_at', now.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately to get usernames and avatars
      const userIds = storiesData?.map(story => story.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Create a map of user IDs to profile data
      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);
      
      // Fetch viewed stories for the current user
      let viewedIds: string[] = [];
      if (user) {
        const { data: viewedData } = await supabase
          .from('stories')
          .select('id, viewed_by')
          .contains('viewed_by', [user.id]);
        
        if (viewedData) {
          viewedIds = viewedData.map(story => story.id);
        }
        setViewedStories(viewedIds);
      }
      
      // Format stories data
      const formattedStories: StoryWithUser[] = [];
      
      if (storiesData) {
        for (const story of storiesData) {
          // Get profile info from the map
          const profileData = profilesMap[story.user_id];
          const username = profileData?.username || generateRandomUsername();
          const avatarUrl = profileData?.avatar_url || getAvatarUrl(username);
          
          // Check if story is viewed by current user
          const viewed_by = Array.isArray(story.viewed_by) ? story.viewed_by : [];
          const isViewed = user ? viewed_by.includes(user.id) : false;
          
          formattedStories.push({
            id: story.id,
            user_id: story.user_id,
            image_url: story.image_url,
            created_at: story.created_at,
            expires_at: story.expires_at,
            username: username,
            avatar_url: avatarUrl,
            viewed: isViewed
          });
        }
      }
      
      setStories(formattedStories);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Failed to load stories",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    
    // Set up real-time subscription for new stories
    const channel = supabase
      .channel('public:stories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
        fetchStories();
        
        // Show notification for new story
        if (payload.new && payload.new.user_id !== user?.id) {
          // Get username of the user who posted the story
          fetchUserName(payload.new.user_id).then(username => {
            toast({
              title: "New Story",
              description: `${username} just added a new story!`,
              variant: "default",
            });
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch username for notifications
  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      return data?.username || 'Someone';
    } catch {
      return 'Someone';
    }
  };

  // Group stories by user_id
  const storiesByUser = stories.reduce<Record<string, StoryWithUser[]>>((acc, story) => {
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
    
    // Check if any stories by this user are unviewed
    const hasUnseenStory = userStories.some(story => !story.viewed);
    
    // Attach this info to the first story
    return {
      ...userStories[0],
      hasUnseenStory
    };
  });

  // Filter stories based on search query
  const filteredStories = searchQuery 
    ? uniqueUserStories.filter(story => 
        story.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : uniqueUserStories;

  const handleStoryClick = (story: StoryWithUser) => {
    setViewingStory({
      id: story.id,
      userId: story.user_id,
      username: story.username,
      avatarUrl: story.avatar_url
    });
    
    // Mark story as viewed
    if (user && !story.viewed) {
      markStoryAsViewed(story.id);
    }
  };
  
  // Mark a story as viewed
  const markStoryAsViewed = async (storyId: string) => {
    if (!user) return;
    
    try {
      // Get current viewed_by array
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('viewed_by')
        .eq('id', storyId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching viewed_by:', fetchError);
        return;
      }
      
      // Update viewed_by array if user isn't already in it
      const viewedBy = Array.isArray(data?.viewed_by) ? data.viewed_by : [];
      
      if (!viewedBy.includes(user.id)) {
        const updatedViewedBy = [...viewedBy, user.id];
        
        const { error: updateError } = await supabase
          .from('stories')
          .update({ viewed_by: updatedViewedBy })
          .eq('id', storyId);
          
        if (updateError) {
          console.error('Error updating viewed_by:', updateError);
          return;
        }
        
        // Update local state
        setViewedStories(prev => [...prev, storyId]);
        setStories(prevStories => 
          prevStories.map(story => 
            story.id === storyId ? { ...story, viewed: true } : story
          )
        );
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Stories</h3>
        <input 
          type="text" 
          placeholder="Search stories" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs px-2 py-1 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-accent w-32"
        />
      </div>
      
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
            
            {filteredStories.map(story => (
              <div 
                key={story.id} 
                className="relative cursor-pointer"
                onClick={() => handleStoryClick(story)}
              >
                <StoryCircle 
                  avatar={story.avatar_url} 
                  name={story.username}
                  hasUnseenStory={story.hasUnseenStory}
                />
              </div>
            ))}
            
            {filteredStories.length === 0 && searchQuery && (
              <div className="flex items-center justify-center w-full py-3 text-sm text-muted-foreground">
                No stories found
              </div>
            )}
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
    </div>
  );
};

export default StoriesRow;
