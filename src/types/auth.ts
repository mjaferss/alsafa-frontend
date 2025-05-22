export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor' | 'user';
  isActive: boolean;
  phoneNumber?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
}
