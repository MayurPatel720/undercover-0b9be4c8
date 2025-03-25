
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, Heart, MessageSquare, Share } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostProps {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  timestamp: string;
  initialLikes: number;
  initialComments: Comment[];
}

export interface Comment {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  timestamp: string;
}

const Post = ({ id, avatar, nickname, content, timestamp, initialLikes, initialComments }: PostProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
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
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mystery',
      nickname: 'Anonymous User',
      content: newComment,
      timestamp: 'Just now'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <Card className="w-full mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/10 p-0.5">
              <div className="flex items-center justify-center w-full h-full bg-primary/10 rounded-full">
                <Ghost className="w-5 h-5 text-primary" />
              </div>
            </Avatar>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {nickname}
                <span className="bg-secondary text-xs px-2 py-0.5 rounded-full">Mystery User</span>
              </div>
              <div className="text-muted-foreground text-xs">{timestamp}</div>
            </div>
          </div>
        </div>
        <p className="text-sm mb-4">{content}</p>
      </CardContent>
      <CardFooter className="flex-col p-0">
        <div className="flex justify-between items-center w-full px-6 py-3 border-t">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-primary text-primary' : ''}`} />
              <span className="text-xs">{likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{comments.length}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full px-6 py-3 bg-secondary/30">
            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" size="sm">Post</Button>
            </form>
            
            <ScrollArea className="h-48 w-full">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-3 pb-3 border-b last:border-b-0">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6">
                      <div className="flex items-center justify-center w-full h-full bg-primary/10 rounded-full">
                        <Ghost className="w-3 h-3 text-primary" />
                      </div>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{comment.nickname}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
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
