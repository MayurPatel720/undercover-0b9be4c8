
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}

const Post: React.FC<PostProps> = ({
  id,
  avatar,
  nickname,
  content,
  image,
  timestamp,
  initialLikes,
  initialComments
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: `new-${Date.now()}`,
        avatar: 'https://source.unsplash.com/random/100x100/?face,me',
        nickname: 'You',
        content: newComment,
        timestamp: 'Just now'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  return (
    <Card className="mb-4 border-0 shadow-md overflow-hidden bg-white rounded-2xl">
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
              <span className="font-semibold">{nickname}</span>
              {Math.random() > 0.5 && (
                <span className="ml-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm mb-3">{content}</p>
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
              className={`rounded-full flex items-center ${liked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500' : ''}`} />
              <span className="ml-1">{likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full flex items-center"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1">{comments.length}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        {showComments && (
          <div className="px-4 py-2 border-t border-border w-full">
            <form onSubmit={handleAddComment} className="flex mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                className="rounded-full ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </form>
            
            <ScrollArea className="max-h-60 overflow-y-auto">
              {comments.map(comment => (
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
                      <div className="font-medium text-xs">{comment.nickname}</div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{comment.timestamp}</div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default Post;
