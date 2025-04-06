
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post as PostType } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoriesRow from './StoriesRow';

const Discover = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All', 'Popular', 'Recent', 'Trending']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to new posts for notifications
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        // Show notification for new post
        if (payload.new) {
          fetchUserName(payload.new.user_id).then(username => {
            toast({
              title: "New Post",
              description: `${username} just added a new post!`,
              variant: "default",
            });
          });
          
          // Refresh posts list
          fetchPosts();
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);
  
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts_with_profiles')
        .select('*');

      if (selectedCategory === 'Popular') {
        query = query.order('likes_count', { ascending: false });
      } else if (selectedCategory === 'Recent') {
        query = query.order('created_at', { ascending: false });
      } else if (selectedCategory === 'Trending') {
        query = query.order('comments_count', { ascending: false });
      } else {
        // Default order
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
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
  
  const handlePostClick = (postId: string) => {
    // Navigate to post detail when clicked
    toast({
      title: 'Post clicked',
      description: `Viewing post details (ID: ${postId})`,
    });
    // In a real app, navigate to post detail page
    // navigate(`/post/${postId}`);
  };

  return (
    <div className="w-full h-full">
      {/* Stories section */}
      <div className="w-full border-b border-border bg-white/5 backdrop-blur-sm">
        <StoriesRow />
      </div>
      
      {/* Categories */}
      <div className="px-4 py-3 flex items-center overflow-x-auto scrollbar-none gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={`cursor-pointer px-3 py-1 ${
              selectedCategory === category ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Grid of posts */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-accent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              {post.image_url ? (
                <>
                  <img
                    src={post.image_url}
                    alt={post.username}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1 fill-white" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center p-2">
                  <p className="text-xs text-center text-muted-foreground line-clamp-4">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;
