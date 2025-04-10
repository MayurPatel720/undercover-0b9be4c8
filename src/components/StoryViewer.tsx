/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StoryWithUser } from '@/lib/database.types';
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoryId: string;
  userId: string;
  username: string;
  avatarUrl: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  initialStoryId,
  userId,
  username,
  avatarUrl
}) => {
  const [stories, setStories] = useState<StoryWithUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && userId) {
      const fetchStories = async () => {
        setLoading(true);
        try {
          const now = new Date();

          const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('user_id', userId)
            .gte('expires_at', now.toISOString())
            .order('created_at', { ascending: true });

          if (error) throw error;

          const initialIndex = data?.findIndex((story: any) => story.id === initialStoryId) || 0;

          const storiesWithUser = data?.map((story: any) => ({
            id: story.id,
            user_id: story.user_id,
            image_url: story.image_url,
            created_at: story.created_at,
            expires_at: story.expires_at,
            username,
            avatar_url: avatarUrl,
            viewed: false
          })) || [];

          setStories(storiesWithUser);
          setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);

          if (data?.length > 0) {
            await markStoryAsViewed(initialStoryId);
          }
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

      fetchStories();
    }
  }, [isOpen, userId, initialStoryId, username, avatarUrl]);

  useEffect(() => {
    if (!loading && stories.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < stories.length - 1) {
          handleNext();
        } else {
          onClose();
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, stories.length, loading]);

  const markStoryAsViewed = async (storyId: string) => {
    if (!user || !storyId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('viewed_by')
        .eq('id', storyId)
        .single();

      if (fetchError) {
        console.error('Error fetching viewed_by:', fetchError);
        return;
      }

      const viewedBy = Array.isArray(data?.viewed_by) ? data.viewed_by : [];

      if (!viewedBy.includes(user.id)) {
        const updatedViewedBy = [...viewedBy, user.id];

        const { error: updateError } = await supabase
          .from('stories')
          .update({ viewed_by: updatedViewedBy })
          .eq('id', storyId);

        if (updateError) {
          console.error('Error updating viewed_by:', updateError);
        }
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      markStoryAsViewed(stories[prevIndex].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      markStoryAsViewed(stories[nextIndex].id);
    } else {
      onClose();
    }
  };

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[80vh]">
        <div className="relative h-[80vh]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <img
              src={currentStory?.image_url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 flex p-1 space-x-1">
  {stories.map((_, index) => (
    <div
      key={index}
      className="relative h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
    >
      {index < currentIndex && (
        <div className="absolute left-0 top-0 h-full w-full bg-blue-500" />
      )}
      {index === currentIndex && (
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 animate-progress"
          style={{ animationDuration: '5s', width: '100%' }}
        />
      )}
    </div>
  ))}
</div>



          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={currentStory?.avatar_url || getAvatarUrl(currentStory?.username || 'user', 'other')}
                  alt={currentStory?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-white drop-shadow-md">{currentStory?.username}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full w-5 h-5 p-1.5 bg-white/20 text-white hover:bg-white/40 dark:bg-black/40 dark:hover:bg-black/60 transition"
            >
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={handleNext}
            disabled={currentIndex === stories.length - 1}
          >
            <ArrowRight className="h-8 w-8" />
          </Button>

          <style>
            {`
              @keyframes progress {
                0% { width: 0; }
                100% { width: 100%; }
              }
            `}
          </style>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
<style>
  {`
    @keyframes progress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    .animate-progress {
      transform-origin: left;
      animation: progress 5s linear forwards;
    }
  `}
</style>
