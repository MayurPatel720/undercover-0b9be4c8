
import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/lib/database.types';
import { toast } from '@/components/ui/use-toast';

interface NotificationsProps {
  className?: string;
  limit?: number;
  onClose?: () => void;
}

const NotificationsList = ({ notifications, onMarkAsRead, onClick }: { 
  notifications: Notification[] | null, 
  onMarkAsRead: (id: string) => void,
  onClick: (id: string) => void
}) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-32 text-gray-500">
        <Bell className="h-10 w-10 mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
          onClick={() => onClick(notification.id as string)}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 text-sm">
              <p className={`${!notification.read ? 'font-medium' : ''}`}>
                {notification.content}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(notification.created_at)}
                </span>
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs px-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id as string);
                    }}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Notifications: React.FC<NotificationsProps> = ({ 
  className = "", 
  limit,
  onClose
}) => {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadNotifications([]);
      setLoading(false);
    }
  }, [user, limit]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setNotifications(data);
      setUnreadNotifications(data ? data.filter(n => !n.read) : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev ? prev.map(n => n.id === id ? { ...n, read: true } : n) : null
      );
      setUnreadNotifications(prev => 
        prev ? prev.filter(n => n.id !== id) : null
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    if (onClose) onClose();
    // Additional logic to navigate to the relevant content can be added here
  };

  // Add the missing formatTimeAgo function
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
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {!limit && (
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        {!limit && (
          <div className="border-b border-border">
            <TabsList className="w-full justify-start p-0 bg-transparent h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none p-3"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none p-3"
              >
                Unread
                {unreadNotifications && unreadNotifications.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{unreadNotifications.length}</span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        )}
        
        <ScrollArea className={limit ? "max-h-96" : "max-h-[calc(100vh-200px)]"}>
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <NotificationsList 
                notifications={notifications} 
                onMarkAsRead={markAsRead} 
                onClick={handleNotificationClick} 
              />
            )}
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <NotificationsList 
                notifications={unreadNotifications} 
                onMarkAsRead={markAsRead}
                onClick={handleNotificationClick}
              />
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default Notifications;
