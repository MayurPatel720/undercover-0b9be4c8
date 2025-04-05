
export interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

export interface Comment {
  id: string;
  avatar: string;
  nickname: string;
  content: string;
  timestamp: string;
  parent_id?: string | null;
}

export interface PostWithProfile extends Post {
  username: string;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

export interface CommentWithProfile {
  id: string | null;
  post_id: string | null;
  content: string | null;
  created_at: string | null;
  user_id: string | null;
  username: string | null;
  avatar_url: string | null;
  parent_id?: string | null;
  gender?: string | null;
}

export interface ProfileStats {
  posts_count: number;
  likes_count: number;
  comments_count: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  gender?: 'male' | 'female' | 'other';
}

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
}

export interface StoryWithUser extends Story {
  username: string;
  avatar_url: string;
}
