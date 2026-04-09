import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, {
  LoginRequest,
  AuthResponse,
  User,
} from '../../services/auth.service';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginModalOpen: boolean;
}

const initialState: AuthState = {
  user: (() => {
    // Try to restore user from localStorage first
    try {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
    }
    // Fallback to extracting from token
    return authService.getUserFromToken();
  })(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  loginModalOpen: false,
};

// Async thunks
export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk<void, string>(
  'auth/logout',
  async (email, { rejectWithValue }) => {
    try {
      await authService.logout(email);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk<string, void>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshToken();
      if (!token) {
        throw new Error('Failed to refresh token');
      }
      return token;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.clearTokens();
      // Clear from localStorage as well
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_email');
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.loginModalOpen = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          email: action.payload.email,
          userName: action.payload.userName,
          roles: action.payload.roles,
        };
        state.loginModalOpen = false;
        state.error = null;
        // Save email to localStorage for persistence
        localStorage.setItem('user_email', action.payload.email);
        // Save full user data to localStorage for quick restoration on refresh
        localStorage.setItem('user_data', JSON.stringify(state.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
        // Clear from localStorage as well
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_email');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear auth even if logout API fails
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
        // Clear from localStorage as well
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_email');
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.user = authService.getUserFromToken();
        state.isAuthenticated = true;
        // Update localStorage with new token
        if (state.user?.email) {
          localStorage.setItem('user_email', state.user.email);
          localStorage.setItem('user_data', JSON.stringify(state.user));
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        // Clear from localStorage as well
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_email');
      });
  },
});

export const { setUser, setToken, clearAuth, setLoginModalOpen, clearError } =
  authSlice.actions;

export default authSlice.reducer;
