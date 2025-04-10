/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Bell,
  User,
  Image,
  MessageCircle,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Notification } from '@/lib/database.types';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await (supabase.rpc as any)(
          'get_user_notifications',
          { user_id_param: user.id }
        );

        if (error) throw error;

        const typedData = data as Notification[];
        setNotifications(typedData);
        setUnreadCount(typedData.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error fetching notifications',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const newNotification = payload.new as unknown as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            toast({
              title: 'New Notification',
              description: (payload.new as any).content
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await (supabase.rpc as any)(
        'mark_all_notifications_as_read',
        { user_id_param: user.id }
      );

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      toast({ title: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: 'Error updating notifications',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (id: string | number) => {
    if (!user) return;

    try {
      const { error } = await (supabase.rpc as any)(
        'mark_notification_as_read',
        { notification_id_param: String(id) }
      );

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === id && !n.read
            ? (setUnreadCount(p => p - 1), { ...n, read: true })
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error updating notification',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    if (notification.entity_id) {
      if (notification.type === 'post' || notification.type === 'comment') {
        navigate(`/post/${notification.entity_id}`);
      } else if (notification.type === 'follow') {
        navigate(`/profile/${notification.actor_id}`);
      }
    }

    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
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
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    return past.toLocaleDateString();
  };

  const showBadge = user && unreadCount > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {showBadge && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row justify-between items-center">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
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
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer flex gap-3 hover:bg-accent ${
                    !notification.read ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actor_id || 'user'}`}
                      alt="User"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="text-sm">{notification.content}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {getNotificationIcon(notification.type)}
                      <span>{formatTimeAgo(notification.created_at)}</span>
                    </div>
                  </div>
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
