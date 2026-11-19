import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '../../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const savedUser = localStorage.getItem('devinterview_user');
const savedToken = localStorage.getItem('devinterview_token');
const savedRefreshToken = localStorage.getItem('devinterview_refresh_token');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  tokens: savedToken && savedRefreshToken ? { accessToken: savedToken, refreshToken: savedRefreshToken } : null,
  isAuthenticated: !!savedToken,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      localStorage.setItem('devinterview_user', JSON.stringify(action.payload.user));
      localStorage.setItem('devinterview_token', action.payload.tokens.accessToken);
      localStorage.setItem('devinterview_refresh_token', action.payload.tokens.refreshToken);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('devinterview_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      localStorage.removeItem('devinterview_user');
      localStorage.removeItem('devinterview_token');
      localStorage.removeItem('devinterview_refresh_token');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
