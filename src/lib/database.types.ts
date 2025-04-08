
// This file contains type definitions for the database

// Database tables
export interface Post {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  // Extended properties from posts_with_profiles view
  username?: string;
  avatar_url?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  gender?: string;
  created_at: string;
  birth_date?: string;
  mobile_number?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  entity_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

export interface CommentWithProfile {
  id?: string;
  content?: string;
  user_id?: string;
  post_id?: string;
  created_at?: string;
  parent_id?: string | null;
  username?: string;
  avatar_url?: string;
  gender?: string;
}

// Story related types
export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  viewed_by?: string[] | null;
}

export interface StoryWithUser extends Story {
  username: string;
  avatar_url: string;
  viewed?: boolean;
  hasUnseenStory?: boolean;
}

// Profile related types
export interface UserProfile extends Profile {
  birth_date?: string;
  mobile_number?: string;
}

export interface ProfileStats {
  posts_count: number;
  likes_count: number;
  comments_count: number;
}
