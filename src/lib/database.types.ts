
// This file contains type definitions for the database

// Database tables
export interface Post {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  gender?: string;
  created_at: string;
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

// Add other types as needed
