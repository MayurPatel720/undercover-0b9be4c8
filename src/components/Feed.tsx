
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Post, { Comment } from './Post';
import StoriesRow from './StoriesRow';
import CreatePost from './CreatePost';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface PostData {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

const Feed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPosts(data as PostData[]);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error fetching posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        // Refetch posts when a new one is added
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Format post creation time
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollArea className="h-[calc(100vh-80px)] w-full">
      <div className="w-full border-b border-border bg-white/5 backdrop-blur-sm">
        <StoriesRow />
      </div>
      <div className="max-w-lg mx-auto py-3 px-4">
        <CreatePost onPostCreated={fetchPosts} />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse w-12 h-12 rounded-full gradient-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p className="text-lg">No posts yet</p>
            <p className="mt-2">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Post
                key={post.id}
                id={post.id}
                avatar={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`}
                nickname={post.username}
                content={post.content || ''}
                image={post.image_url || undefined}
                timestamp={formatTimeAgo(post.created_at)}
                initialLikes={post.likes_count || 0}
                initialComments={[]}
                realData={true}
                userId={post.user_id}
                onInteractionUpdated={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default Feed;
