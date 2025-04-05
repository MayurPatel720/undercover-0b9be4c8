
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Post from '@/components/Post';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { User, Settings, Image, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';
import { Post as PostType, ProfileStats } from '@/lib/database.types';

const ProfilePage = () => {
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    posts_count: 0,
    likes_count: 0,
    comments_count: 0
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts_with_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUserPosts(data || []);
        
        // Calculate stats
        if (data) {
          const totalLikes = data.reduce((sum, post) => sum + (post.likes_count || 0), 0);
          const totalComments = data.reduce((sum, post) => sum + (post.comments_count || 0), 0);
          
          setStats({
            posts_count: data.length,
            likes_count: totalLikes,
            comments_count: totalComments
          });
        }
      } catch (error: any) {
        console.error('Error fetching user posts:', error);
        toast({
          title: 'Error fetching posts',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

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

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    if (!user) {
      navigate('/');
    }
  };

  const generateUsername = () => {
    if (!user) return 'Guest User';
    return user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-20 pb-20 w-full max-w-screen-xl mx-auto">
        <ScrollArea className="h-[calc(100vh-140px)] w-full">
          {!user ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-center text-lg">Please sign in to view your profile.</p>
            </div>
          ) : (
            <div className="max-w-lg mx-auto py-6 px-4">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full p-1 gradient-primary mb-4">
                    <div className="w-full h-full bg-white rounded-full overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{generateUsername()}</h1>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">@{generateUsername()}</p>
                  
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{stats.posts_count}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{stats.likes_count}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Likes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{stats.comments_count}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Comments</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mt-6">
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <User className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">Profile</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Image className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">Media</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Heart className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">Likes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Settings className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">Settings</span>
                  </div>
                </div>
              </div>
              
              {/* User Posts */}
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Posts</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse w-12 h-12 rounded-full gradient-primary"></div>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-lg text-gray-800 dark:text-white">No posts yet</p>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Share your first post on the home page!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map(post => (
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
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </main>
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
    </div>
  );
};

export default ProfilePage;
