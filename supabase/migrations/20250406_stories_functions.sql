
-- RPC functions for handling stories

-- Function to create a new story
CREATE OR REPLACE FUNCTION public.create_story(
  user_id_param UUID,
  image_url_param TEXT,
  expires_at_param TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
  story_id UUID;
BEGIN
  INSERT INTO public.stories (user_id, image_url, expires_at)
  VALUES (user_id_param, image_url_param, expires_at_param)
  RETURNING id INTO story_id;
  
  RETURN story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stories
CREATE OR REPLACE FUNCTION public.get_user_stories(
  user_id_param UUID
) RETURNS SETOF public.stories AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.stories
  WHERE user_id = user_id_param
  AND expires_at >= NOW()
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
