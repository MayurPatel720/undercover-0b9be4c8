
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post as PostType } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';

const Discover = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All', 'Popular', 'Recent', 'Trending']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory === 'Popular') {
        query = query.order('likes_count', { ascending: false });
      } else if (selectedCategory === 'Recent') {
        query = query.order('created_at', { ascending: false });
      } else if (selectedCategory === 'Trending') {
        query = query.order('comments_count', { ascending: false });
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

  return (
    <div className="w-full h-full">
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
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden"
            >
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-xs text-center p-2 text-muted-foreground">
                    {post.content?.substring(0, 50)}
                    {post.content && post.content.length > 50 ? '...' : ''}
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
