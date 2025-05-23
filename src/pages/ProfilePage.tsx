
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Post from '@/components/Post';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { User, Settings, Image, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';
import { Post as PostType, ProfileStats, UserProfile } from '@/lib/database.types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from '@/utils/nameUtils';
import ProfileSettings from '@/components/profile/ProfileSettings';

const ProfilePage = () => {
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    posts_count: 0,
    likes_count: 0,
    comments_count: 0
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          // Make sure the gender is one of the allowed values
          const safeGender = profileData.gender === 'male' || profileData.gender === 'female' ? 
            profileData.gender : 'other';
          
          setUserProfile({
            ...profileData,
            gender: safeGender as 'male' | 'female' | 'other'
          });
          
          // Set gender from profile if available
          if (profileData.gender) {
            setGender(safeGender as 'male' | 'female' | 'other');
          }
        }
      } catch (error: any) {
        console.error('Error in profile fetch:', error);
      }
    };

    fetchUserProfile();

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
    return user.user_metadata?.anonymous_username || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  };

  const updateGender = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gender })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local avatar
      const avatarUrl = getAvatarUrl(generateUsername(), gender);
      
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      toast({
        title: 'Profile updated',
        description: 'Your gender preference has been saved.',
      });
      
      setShowGenderSelect(false);
      
      // Reload profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        // Make sure the gender is one of the allowed values
        const safeGender = data.gender === 'male' || data.gender === 'female' ? 
          data.gender : 'other';
            
        setUserProfile({
          ...data,
          gender: safeGender as 'male' | 'female' | 'other'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const openProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const closeProfileSettings = () => {
    setShowProfileSettings(false);
    // Refresh user profile after settings are closed
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            const safeGender = data.gender === 'male' || data.gender === 'female' ? 
              data.gender : 'other';
            
            setUserProfile({
              ...data,
              gender: safeGender as 'male' | 'female' | 'other'
            });
            
            if (data.gender) {
              setGender(safeGender as 'male' | 'female' | 'other');
            }
          }
        });
    }
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
                        src={userProfile?.avatar_url || getAvatarUrl(generateUsername(), gender)}
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
                  
                  {/* Profile actions */}
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openProfileSettings}
                      className="text-xs"
                    >
                      Edit Profile
                    </Button>
                    
                    {/* Legacy gender selection - could be removed when profile settings is fully implemented */}
                    {showGenderSelect ? (
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-3 text-gray-800 dark:text-gray-200">Select Gender for Avatar</h3>
                        <RadioGroup defaultValue={gender} onValueChange={(val) => setGender(val as 'male' | 'female' | 'other')}>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="text-gray-800 dark:text-gray-200">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="text-gray-800 dark:text-gray-200">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other" className="text-gray-800 dark:text-gray-200">Other</Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="default" onClick={updateGender}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowGenderSelect(false)}>Cancel</Button>
                          </div>
                        </RadioGroup>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* User profile info */}
                {userProfile?.birth_date || userProfile?.mobile_number ? (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Profile Information</h3>
                    <div className="space-y-2 text-sm">
                      {userProfile.birth_date && (
                        <div className="flex items-start">
                          <span className="text-gray-600 dark:text-gray-400 w-24">Birth Date:</span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {new Date(userProfile.birth_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {userProfile.mobile_number && (
                        <div className="flex items-start">
                          <span className="text-gray-600 dark:text-gray-400 w-24">Mobile:</span>
                          <span className="text-gray-800 dark:text-gray-200">{userProfile.mobile_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                
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
                  <div 
                    className="flex flex-col items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={openProfileSettings}
                  >
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
                      avatar={post.avatar_url || getAvatarUrl(post.username)}
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
      <ProfileSettings 
        isOpen={showProfileSettings}
        onClose={closeProfileSettings}
        userProfile={userProfile}
      />
    </div>
  );
};

export default ProfilePage;
