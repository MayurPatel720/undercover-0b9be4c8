
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StoryWithUser } from '@/lib/database.types';
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import { toast } from '@/components/ui/use-toast';

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

  // Effect to fetch all stories for this user
  useEffect(() => {
    if (isOpen && userId) {
      const fetchStories = async () => {
        setLoading(true);
        try {
          // Get current timestamp
          const now = new Date();
          
          // Direct query to get stories
          const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('user_id', userId)
            .gte('expires_at', now.toISOString())
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          
          // Find index of the initialStoryId
          const initialIndex = data?.findIndex((story: any) => story.id === initialStoryId) || 0;
          
          // Add user info to stories
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
          
          // Mark this story as viewed
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
  
  // Auto progress to next story after 5 seconds
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
    try {
      // In a real app, you would track views in a separate table
      // For now we'll just console log it
      console.log('Marking story as viewed:', storyId);
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
          {/* Story image */}
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
          
          {/* Progress indicators */}
          <div className="absolute top-0 left-0 right-0 flex p-1 space-x-1">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index < currentIndex 
                    ? 'bg-white' 
                    : index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
                style={{
                  animation: index === currentIndex ? 'progress 5s linear forwards' : undefined
                }}
              />
            ))}
          </div>
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
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
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-white hover:bg-black/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation controls */}
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
          
          {/* Add animation for progress bar */}
          <style jsx>{`
            @keyframes progress {
              0% { width: 0; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
