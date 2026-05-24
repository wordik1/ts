import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

const MOCK_USER: User = {
  id: 'mock-user-1',
  name: 'Студент',
  email: 'student@example.com',
};

const initialState: AuthState = {
  user: MOCK_USER,
  isLoggedIn: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isLoggedIn = action.payload !== null;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
