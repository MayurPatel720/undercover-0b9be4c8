
-- Function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  actor_id UUID,
  type TEXT,
  entity_id UUID,
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, user_id, actor_id, type, entity_id, content, read, created_at
  FROM public.notifications
  WHERE user_id = user_id_param
  ORDER BY created_at DESC;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id_param UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications
  SET read = true
  WHERE user_id = user_id_param AND read = false;
$$;

-- Function to mark a single notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id_param UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications
  SET read = true
  WHERE id = notification_id_param;
$$;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
