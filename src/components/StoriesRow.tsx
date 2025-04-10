/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const { user } = useAuth();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const now = new Date();

      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .gte('expires_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = storiesData?.map(story => story.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const profilesMap = (profilesData || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);

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

      const formattedStories: StoryWithUser[] = storiesData?.map(story => {
        const profileData = profilesMap[story.user_id];
        const username = profileData?.username || generateRandomUsername();
        const avatarUrl = profileData?.avatar_url || getAvatarUrl(username);
        
        const viewed_by: string[] = Array.isArray(story.viewed_by)
          ? story.viewed_by.map((id) => String(id)).filter((v): v is string => typeof v === 'string')
          : typeof story.viewed_by === 'string'
            ? [story.viewed_by]
            : [];
      
        const isViewed = user ? viewed_by.includes(user.id) : false;
      
        return {
          ...story,
          username,
          avatar_url: avatarUrl,
          viewed: isViewed,
          viewed_by,
        };
      }) || [];
      
      

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

    const channel = supabase
      .channel('public:stories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
        fetchStories();

        if (payload.new && payload.new.user_id !== user?.id) {
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

  const storiesByUser = stories.reduce<Record<string, StoryWithUser[]>>((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {});

  const uniqueUserStories = Object.values(storiesByUser).map(userStories => {
    userStories.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const hasUnseenStory = userStories.some(story => !story.viewed);

    return {
      ...userStories[0],
      hasUnseenStory
    };
  });

  const handleStoryClick = (story: StoryWithUser) => {
    setViewingStory({
      id: story.id,
      userId: story.user_id,
      username: story.username,
      avatarUrl: story.avatar_url
    });

    if (user && !story.viewed) {
      markStoryAsViewed(story.id);
    }
  };

  const markStoryAsViewed = async (storyId: string) => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('viewed_by')
        .eq('id', storyId)
        .single();

      if (fetchError) return;

      const viewedBy = Array.isArray(data?.viewed_by) ? data.viewed_by : [];

      if (!viewedBy.includes(user.id)) {
        const updatedViewedBy = [...viewedBy, user.id];

        const { error: updateError } = await supabase
          .from('stories')
          .update({ viewed_by: updatedViewedBy })
          .eq('id', storyId);

        if (!updateError) {
          setViewedStories(prev => [...prev, storyId]);
          setStories(prevStories => 
            prevStories.map(story => 
              story.id === storyId ? { ...story, viewed: true } : story
            )
          );
        }
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  return (
    <div className="w-full">
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
                  hasUnseenStory={story.hasUnseenStory}
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
    </div>
  );
};

export default StoriesRow;
