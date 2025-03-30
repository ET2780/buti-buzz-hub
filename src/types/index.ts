
export interface User {
  id?: string;
  name: string;
  avatar: string;
  isAdmin?: boolean;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string | Date; // Modified to accept both string and Date
  updated_at: string | Date; // Modified to accept both string and Date
}

export type UserRole = 'admin' | 'customer';

export interface UserWithRole extends User {
  role: UserRole;
}
