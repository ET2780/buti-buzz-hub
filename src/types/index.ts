export interface User {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
  email?: string | null;
}
