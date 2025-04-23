import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { users, currentUser } from '@/mocks/users';
import api, { setAuthToken, removeAuthToken } from '@/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string, username: string) => Promise<void>;
  signup: (name: string, email: string, password: string, username?: string, location?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Authentication store using Zustand
 * 
 * This implementation uses mock data for now, but is structured to be easily
 * connected to a real API with OAuth 2.0 in the future.
 * 
 * Required API endpoints:
 * - POST /auth/login - Login with email, password, and username
 * - POST /auth/register - Register new user
 * - POST /auth/logout - Logout user
 * - GET /auth/me - Get current user info
 * - PUT /users/profile - Update user profile
 * - POST /users/avatar - Upload user avatar
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would validate the token with the API
          // GET /auth/me
          // const response = await api.get('/auth/me');
          // set({ user: response.data, isAuthenticated: true, isLoading: false });
          
          // For now, we'll use the mock current user if we have a token
          const token = await AsyncStorage.getItem('auth_token');
          if (token) {
            set({ 
              user: currentUser, 
              isAuthenticated: true, 
              token,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              token: null,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // If token validation fails, clear the token
          await removeAuthToken();
          set({ 
            user: null, 
            isAuthenticated: false, 
            token: null,
            isLoading: false 
          });
        }
      },
      
      login: async (email, password, username) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app with OAuth 2.0, this would be:
          // POST /auth/login
          // const response = await api.post('/auth/login', { email, password, username });
          // await setAuthToken(response.data.token);
          // set({ user: response.data.user, token: response.data.token, isAuthenticated: true, isLoading: false });
          
          // For now, we'll just check if the email exists in our mock users
          const user = users.find(u => u.email === email && u.username === username);
          
          if (!user) {
            throw new Error('Invalid credentials');
          }
          
          // Mock token generation
          const mockToken = `mock_token_${Math.random().toString(36).substring(2)}`;
          await setAuthToken(mockToken);
          
          set({ 
            user, 
            token: mockToken,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      signup: async (name, email, password, username = '', location = '') => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app with OAuth 2.0, this would be:
          // POST /auth/register
          // const response = await api.post('/auth/register', { name, email, password, username, location });
          // Note: We don't set the token here as we want the user to login after registration
          
          // Check if email already exists
          const existingUser = users.find(u => u.email === email);
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Check if username already exists
          if (username) {
            const existingUsername = users.find(u => u.username === username);
            if (existingUsername) {
              throw new Error('Username already taken');
            }
          }
          
          // For now, we'll just create a mock user
          const newUser: User = {
            id: (users.length + 1).toString(),
            name,
            username: username || email.split('@')[0],
            email,
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
            bio: 'New snooker enthusiast',
            location: location || '',
            stats: {
              winRate: 0,
              highestBreak: 0,
              averageBreak: 0,
              potSuccessRate: 0,
              gamesPlayed: 0,
              totalPoints: 0,
              skillLevel: 1
            },
            connections: [],
            isOnline: true,
            lastActive: new Date().toISOString()
          };
          
          // In a real app, we would not authenticate the user here
          // We would just return success and let them login
          set({ isLoading: false });
          
          // We don't return the user anymore since the function is declared to return void
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error; // Re-throw to allow handling in the component
        }
      },
      
      logout: async () => {
        try {
          // In a real app with OAuth 2.0, this would be:
          // POST /auth/logout
          // await api.post('/auth/logout');
          
          // Remove token from storage
          await removeAuthToken();
          
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Even if the API call fails, we should still clear local state
          await removeAuthToken();
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false 
          });
        }
      },
      
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app with OAuth 2.0, this would be:
          // PUT /users/profile
          // const response = await api.put('/users/profile', data);
          // set({ user: response.data, isLoading: false });
          
          // Update user data
          set(state => ({
            user: state.user ? { ...state.user, ...data } : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile', 
            isLoading: false 
          });
        }
      },
      
      uploadAvatar: async (uri) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app with OAuth 2.0, this would be:
          // POST /users/avatar
          // const formData = new FormData();
          // formData.append('avatar', { uri, type: 'image/jpeg', name: 'avatar.jpg' });
          // const response = await api.post('/users/avatar', formData);
          // set(state => ({
          //   user: state.user ? { ...state.user, avatar: response.data.avatarUrl } : null,
          //   isLoading: false
          // }));
          
          // Update user avatar
          set(state => ({
            user: state.user ? { ...state.user, avatar: uri } : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to upload avatar', 
            isLoading: false 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'snookiq-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);