export type LoginCredentials = {
  username: string;
  password: string;
};

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}