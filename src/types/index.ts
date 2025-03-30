
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
