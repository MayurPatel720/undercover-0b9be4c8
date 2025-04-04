
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
}

export interface PostWithProfile extends Post {
  username: string;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

export interface CommentWithProfile {
  id: string;
  post_id: string | null;
  content: string | null;
  created_at: string | null;
  user_id: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface ProfileStats {
  posts_count: number;
  likes_count: number;
  comments_count: number;
}
