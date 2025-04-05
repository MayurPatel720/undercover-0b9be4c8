
-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add RLS policies
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all stories (public)
CREATE POLICY "Anyone can view stories"
  ON public.stories
  FOR SELECT
  USING (true);

-- Policy to allow users to insert their own stories
CREATE POLICY "Users can create their own stories"
  ON public.stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own stories
CREATE POLICY "Users can update their own stories"
  ON public.stories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own stories
CREATE POLICY "Users can delete their own stories"
  ON public.stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
