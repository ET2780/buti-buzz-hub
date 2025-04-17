import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends Partial<SupabaseUser> {
  id: string;
  username?: string;
  avatar?: string;
  isAdmin?: boolean;
  tags?: string[];
  customStatus?: string;
  isTemporary?: boolean;
  user_metadata?: {
    isTemporary?: boolean;
    username?: string;
    isAdmin?: boolean;
    name?: string;
    avatar?: string;
    tags?: string[];
    customStatus?: string;
    permissions?: {
      isAdmin?: boolean;
      canManagePerks?: boolean;
      canManageUsers?: boolean;
      canManagePinnedMessages?: boolean;
      canSuggestSongs?: boolean;
      canManageSongs?: boolean;
    };
  };
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
  isAutomated?: boolean;
  sender: {
    id: string;
    name: string;
    avatar: string;
    isAdmin: boolean;
    tags: string[];
    customStatus?: string;
    user_metadata: {
      name: string;
      avatar: string;
      tags: string[];
      customStatus?: string;
      permissions: {
        isAdmin: boolean;
      };
    };
  };
}

export interface DailyPrompt {
  id: string;
  text: string;
  createdAt: Date;
}

export interface SystemMessage {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface PinnedMessage {
  id: string;
  message: string;
  created_at: string;
}
