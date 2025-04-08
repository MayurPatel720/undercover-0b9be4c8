import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, Reply, Trash, Edit, X, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CommentWithProfile } from '@/lib/database.types';
import { generateRandomUsername, getAvatarUrl, getSafeGender } from '@/utils/nameUtils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface Comment {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  timestamp: string;
  parent_id?: string | null;
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();

  const isPostOwner = user && userId && user.id === userId;

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

  useEffect(() => {
    setEditedContent(content);
    
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
              const formattedComments: Comment[] = data.map((comment: CommentWithProfile) => {
                const username = comment.username || generateRandomUsername();
                
                return {
                  id: comment.id || '',
                  avatar: comment.avatar_url || getAvatarUrl(username, getSafeGender(comment.gender)),
                  nickname: username,
                  content: comment.content || '',
                  timestamp: formatTimeAgo(comment.created_at || ''),
                  parent_id: comment.parent_id
                };
              });
              
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
  }, [id, showComments, realData, content]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url, gender')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        const username = profileData?.username || 
                        (user.user_metadata?.username || generateRandomUsername());
        
        if (!user.user_metadata?.username) {
          await supabase.auth.updateUser({
            data: { username: username }
          });
        }
        
        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: id,
            user_id: user.id,
            content: newComment.trim(),
            parent_id: replyingTo
          })
          .select();
        
        if (error) throw error;
        
        const commentItem = data[0];
        const newCommentObj: Comment = {
          id: commentItem.id,
          avatar: profileData?.avatar_url || getAvatarUrl(username, getSafeGender(profileData?.gender)),
          nickname: username,
          content: commentItem.content,
          timestamp: 'Just now',
          parent_id: commentItem.parent_id
        };
        
        setComments(prev => [newCommentObj, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
        setReplyingTo(null);
        
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
      const username = user ? (user.user_metadata?.username || generateRandomUsername()) : generateRandomUsername();
      const comment: Comment = {
        id: `new-${Date.now()}`,
        avatar: getAvatarUrl(username),
        nickname: username,
        content: newComment,
        timestamp: 'Just now',
        parent_id: replyingTo
      };
      setComments(prev => [comment, ...prev]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      setReplyingTo(null);
      
      if (!showComments) {
        setShowComments(true);
      }
    }
  };

  const handleReply = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReplyingTo(commentId);
    const inputElement = document.getElementById('comment-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleShare = async (platform?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user && realData) {
      setShowAuthModal(true);
      return;
    }
    
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
      description: platform ? `Post shared to ${platform}` : 'Post shared',
    });
  };

  const handleOpenEditDialog = () => {
    setEditedContent(content);
    if (image) {
      setEditImagePreview(image);
    } else {
      setEditImagePreview(null);
    }
    setEditImageFile(null);
    setShowEditDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const removeEditImage = () => {
    setEditImageFile(null);
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditImagePreview(null);
  };

  const handleSaveEdit = async () => {
    if (!user || !isPostOwner || !realData) return;
    
    try {
      let imageUrl = image;
      
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, editImageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      } else if (editImagePreview === null && image) {
        imageUrl = null;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          content: editedContent.trim() || null,
          image_url: imageUrl
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been updated",
      });
      
      setShowEditDialog(false);
      
      if (onInteractionUpdated) {
        onInteractionUpdated();
      }
      
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error updating post',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePost = async () => {
    if (!user || !isPostOwner || !realData) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your post has been deleted",
      });
      
      setShowDeleteConfirm(false);
      
      if (onInteractionUpdated) {
        onInteractionUpdated();
      }
      
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive'
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

  const getParentComment = (parentId: string | null | undefined) => {
    if (!parentId) return null;
    return comments.find(comment => comment.id === parentId);
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
        
        {isPostOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenEditDialog}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        )}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowComments(!showComments);
              }}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DropdownMenuItem onClick={(e) => handleShare(undefined, e)} className="text-gray-700 dark:text-gray-300">
                Share to profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare('whatsapp', e)} className="text-gray-700 dark:text-gray-300">
                Share to WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare('twitter', e)} className="text-gray-700 dark:text-gray-300">
                Share to Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare('facebook', e)} className="text-gray-700 dark:text-gray-300">
                Share to Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare('telegram', e)} className="text-gray-700 dark:text-gray-300">
                Share to Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleShare('linkedin', e)} className="text-gray-700 dark:text-gray-300">
                Share to LinkedIn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {showComments && (
          <div className="px-4 py-2 border-t border-border w-full">
            <form onSubmit={handleAddComment} className="flex mb-3">
              <input
                id="comment-input"
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-white"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                className="rounded-full ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : replyingTo ? 'Reply' : 'Post'}
              </Button>
              {replyingTo && (
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full ml-1"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              )}
            </form>
            
            {replyingTo && (
              <div className="mb-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Replying to comment from <span className="font-medium">{comments.find(c => c.id === replyingTo)?.nickname || "user"}</span>
                </p>
              </div>
            )}
            
            <ScrollArea className="max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => {
                    const parentComment = getParentComment(comment.parent_id);
                    
                    return (
                      <div key={comment.id} className="flex items-start space-x-2">
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
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                            <div className="font-medium text-xs text-gray-800 dark:text-white">{comment.nickname}</div>
                            
                            {parentComment && (
                              <div className="mb-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                                <span className="font-medium">@{parentComment.nickname}:</span> {parentComment.content.length > 50 ? `${parentComment.content.substring(0, 50)}...` : parentComment.content}
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-800 dark:text-white">{comment.content}</p>
                          </div>
                          <div className="flex items-center mt-1 space-x-3">
                            <div className="text-xs text-gray-500 dark:text-muted-foreground">{comment.timestamp}</div>
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 hover:text-primary"
                              onClick={(e) => handleReply(comment.id, e)}
                            >
                              <Reply className="h-3 w-3 mr-1" /> Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardFooter>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[100px] resize-none"
            />
            
            {editImagePreview ? (
              <div className="relative mb-3 rounded-xl overflow-hidden">
                <img 
                  src={editImagePreview} 
                  alt="Post preview" 
                  className="max-h-64 w-full object-contain bg-gray-100"
                />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={removeEditImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit-image-upload')?.click()}
                  className="w-full py-8 border-dashed flex flex-col items-center justify-center"
                >
                  <ImageIcon className="h-10 w-10 mb-2 text-gray-400" />
                  <span>Click to add an image</span>
                </Button>
                <input
                  id="edit-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this post? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Card>
  );
};

export default Post;
