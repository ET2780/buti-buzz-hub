
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
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'admin' | 'customer';

export interface UserWithRole extends User {
  role: UserRole;
}
