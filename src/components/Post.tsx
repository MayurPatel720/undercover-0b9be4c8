
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CommentWithProfile } from '@/lib/database.types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Comment {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  timestamp: string;
}

interface PostProps {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  image?: string;
  timestamp: string;
  initialLikes: number;
  initialComments: Comment[];
  realData?: boolean;
  userId?: string;
  onInteractionUpdated?: () => void;
}

const Post: React.FC<PostProps> = ({
  id,
  avatar,
  nickname,
  content,
  image,
  timestamp,
  initialLikes,
  initialComments,
  realData = false,
  userId,
  onInteractionUpdated
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentCount, setCommentCount] = useState(initialComments.length);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Check if the current user has liked this post
  useEffect(() => {
    if (realData && user) {
      const checkLikeStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            setLiked(true);
          }
        } catch (err) {
          console.error('Error checking like status:', err);
        }
      };
      
      checkLikeStatus();
    }
  }, [id, user, realData]);

  // Fetch comments and update comment count for this post
  useEffect(() => {
    if (realData) {
      const fetchCommentCount = async () => {
        try {
          const { data, error } = await supabase
            .from('comments')
            .select('id', { count: 'exact' })
            .eq('post_id', id);
            
          if (!error) {
            setCommentCount(data?.length || 0);
          }
        } catch (err) {
          console.error('Error fetching comment count:', err);
        }
      };
      
      fetchCommentCount();
      
      if (showComments) {
        const fetchComments = async () => {
          try {
            const { data, error } = await supabase
              .from('comments_with_profiles')
              .select('*')
              .eq('post_id', id)
              .order('created_at', { ascending: false });
            
            if (error) {
              console.error('Error fetching comments:', error);
              return;
            }
            
            if (data) {
              const formattedComments: Comment[] = data.map((comment: CommentWithProfile) => ({
                id: comment.id || '',
                avatar: comment.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username || 'anonymous'}`,
                nickname: comment.username || generateRandomUsername(),
                content: comment.content || '',
                timestamp: formatTimeAgo(comment.created_at || '')
              }));
              
              setComments(formattedComments);
              setCommentCount(formattedComments.length);
            }
          } catch (err) {
            console.error('Error in comment fetch:', err);
          }
        };
        
        fetchComments();
      }
    }
  }, [id, showComments, realData]);

  // Generate a random username for anonymous users
  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Amazing', 'Awesome', 'Super', 'Mega', 'Epic', 'Rad'];
    const nouns = ['Star', 'Ninja', 'Warrior', 'Hero', 'Coder', 'Genius', 'Master'];
    const num = Math.floor(Math.random() * 1000);
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj}${noun}${num}`;
  };

  const handleLike = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (realData) {
      try {
        if (liked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          setLikes(prev => Math.max(0, prev - 1));
          setLiked(false);
        } else {
          const { error } = await supabase
            .from('likes')
            .insert({
              post_id: id,
              user_id: user.id
            });
            
          if (error) throw error;
          
          setLikes(prev => prev + 1);
          setLiked(true);
        }
        
        if (onInteractionUpdated) {
          onInteractionUpdated();
        }
      } catch (error: any) {
        console.error('Error updating like:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    } else {
      if (liked) {
        setLikes(prev => prev - 1);
      } else {
        setLikes(prev => prev + 1);
      }
      setLiked(!liked);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!newComment.trim()) return;
    
    if (realData) {
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: id,
            user_id: user.id,
            content: newComment.trim()
          })
          .select();
        
        if (error) throw error;
        
        // Get commenter profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Add the new comment to the list
        const commentItem = data[0];
        const username = profileData?.username || user.user_metadata?.username || user.email?.split('@')[0] || generateRandomUsername();
        const newCommentObj: Comment = {
          id: commentItem.id,
          avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          nickname: username,
          content: commentItem.content,
          timestamp: 'Just now'
        };
        
        setComments(prev => [newCommentObj, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
        
        // Make sure comments are shown after posting
        if (!showComments) {
          setShowComments(true);
        }
        
        if (onInteractionUpdated) {
          onInteractionUpdated();
        }
      } catch (error: any) {
        console.error('Error adding comment:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const username = user ? (user.user_metadata?.username || user.email?.split('@')[0] || generateRandomUsername()) : generateRandomUsername();
      const comment: Comment = {
        id: `new-${Date.now()}`,
        avatar: user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` : 'https://source.unsplash.com/random/100x100/?face,me',
        nickname: username,
        content: newComment,
        timestamp: 'Just now'
      };
      setComments(prev => [comment, ...prev]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      
      // Make sure comments are shown after posting
      if (!showComments) {
        setShowComments(true);
      }
    }
  };

  const handleShare = async (platform?: string) => {
    if (!user && realData) {
      setShowAuthModal(true);
      return;
    }
    
    // Share to external platforms
    if (platform) {
      let shareUrl = '';
      const postUrl = `${window.location.origin}/post/${id}`;
      const text = `Check out this post by ${nickname}`;
      
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ': ' + postUrl)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(text)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
      
      toast({
        title: 'Shared!',
        description: `Post shared to ${platform}`,
      });
      return;
    }
    
    // Internal app sharing
    if (realData) {
      try {
        const { error } = await supabase
          .from('shares')
          .insert({
            post_id: id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        toast({
          title: 'Post shared',
          description: 'This post has been shared to your profile.'
        });
        
        if (onInteractionUpdated) {
          onInteractionUpdated();
        }
      } catch (error: any) {
        console.error('Error sharing post:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Post shared',
        description: 'This post has been shared to your profile.'
      });
    }
  };

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
    <Card className="mb-4 border-0 shadow-md overflow-hidden bg-white dark:bg-card rounded-2xl">
      <CardHeader className="p-4 pb-2 flex flex-row items-center space-y-0">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full p-0.5 gradient-primary">
            <div className="w-full h-full bg-white rounded-full overflow-hidden">
              <img 
                src={avatar} 
                alt={nickname} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://source.unsplash.com/random/100x100/?face';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-semibold text-black dark:text-white">{nickname}</span>
              {Math.random() > 0.5 && (
                <span className="ml-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600 dark:text-muted-foreground">{timestamp}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {content && <p className="text-sm mb-3 text-black dark:text-white">{content}</p>}
        {image && (
          <div className="rounded-xl overflow-hidden mb-2">
            <img 
              src={image} 
              alt="Post content" 
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://source.unsplash.com/random/600x400/?abstract';
              }}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full flex items-center ${liked ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500' : ''}`} />
              <span className="ml-1">{likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full flex items-center text-gray-700 dark:text-gray-300"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1">{commentCount}</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-gray-700 dark:text-gray-300"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleShare()}>
                Share to profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                Share to WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                Share to Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                Share to Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('telegram')}>
                Share to Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                Share to LinkedIn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {showComments && (
          <div className="px-4 py-2 border-t border-border w-full">
            <form onSubmit={handleAddComment} className="flex mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-white"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                className="rounded-full ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </form>
            
            <ScrollArea className="max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={comment.avatar} 
                        alt={comment.nickname} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://source.unsplash.com/random/100x100/?face';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-2xl px-3 py-2">
                        <div className="font-medium text-xs text-gray-800 dark:text-white">{comment.nickname}</div>
                        <p className="text-sm text-gray-800 dark:text-white">{comment.content}</p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{comment.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}
      </CardFooter>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Card>
  );
};

export default Post;
