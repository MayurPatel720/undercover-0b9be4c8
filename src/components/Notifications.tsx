
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Bell, User, Image, MessageCircle, Heart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'post' | 'like' | 'comment' | 'story' | 'follow';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  actorName: string;
  actorAvatar: string;
  entityId?: string; // Post ID, comment ID, etc.
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // This is just a mock implementation - in a real app you would fetch notifications from your database
  useEffect(() => {
    if (!user) return;

    // Initialize with some mock data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'post',
        message: 'created a new post',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        actorName: 'EpicUser123',
        actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EpicUser123'
      },
      {
        id: '2',
        type: 'like',
        message: 'liked your post',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false,
        actorName: 'CoolCat88',
        actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CoolCat88',
        entityId: '123'
      },
      {
        id: '3',
        type: 'comment',
        message: 'commented on your post',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        read: true,
        actorName: 'MegaFan42',
        actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MegaFan42',
        entityId: '123'
      },
      {
        id: '4',
        type: 'story',
        message: 'added a new story',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        read: true,
        actorName: 'StarGazer',
        actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StarGazer'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Setup subscription for new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.new && payload.new.user_id !== user.id) {
          // Fetch user info
          fetchUserInfo(payload.new.user_id).then(userInfo => {
            if (userInfo) {
              const newNotification: Notification = {
                id: payload.new.id,
                type: 'post',
                message: 'created a new post',
                timestamp: new Date().toISOString(),
                read: false,
                actorName: userInfo.username,
                actorAvatar: userInfo.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.username}`
              };

              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Helper function to fetch user info
  const fetchUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => {
        if (notification.id === id && !notification.read) {
          setUnreadCount(prev => prev - 1);
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.entityId) {
      // In a real app, you would navigate to the specific post, comment, etc.
      // navigate(`/post/${notification.entityId}`);
      console.log(`Navigate to: /post/${notification.entityId}`);
    }
    
    // Close the notifications panel
    setOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'post':
        return <Image className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'story':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'follow':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  // Only show badge if user is logged in and has unread notifications
  const showBadge = user && unreadCount > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {showBadge && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row justify-between items-center">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Sign in to see notifications</h3>
            <p className="text-sm text-muted-foreground">
              You'll need to log in to see your notification activity
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-100px)] pr-4">
            <div className="space-y-1 py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer flex gap-3 hover:bg-accent ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={notification.actorAvatar} alt={notification.actorName} />
                    <AvatarFallback>
                      {notification.actorName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{notification.actorName}</span>
                      <span className="text-sm text-muted-foreground">{notification.message}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getNotificationIcon(notification.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="h-2 w-2 bg-primary rounded-full self-center" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Notifications;
