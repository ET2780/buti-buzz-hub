
export interface User {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  email?: string | null;
  tags?: string[];
  customStatus?: string;
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
  sender: User;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
  isAutomated?: boolean;
  isPinned?: boolean;
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
