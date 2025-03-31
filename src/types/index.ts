
export interface User {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  email?: string | null;
  tags?: string[];
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
}

export interface DailyPrompt {
  id: string;
  text: string;
  createdAt: Date;
}
