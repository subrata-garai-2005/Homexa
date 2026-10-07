import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('homely_token', res.data.token);
    localStorage.setItem('homely_user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('homely_token', res.data.token);
    localStorage.setItem('homely_user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Registration failed';
    return rejectWithValue(message);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile');
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data);
    localStorage.setItem('homely_user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (propertyId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/auth/wishlist/${propertyId}`);
    return res.data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Wishlist update failed');
  }
});

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('homely_user');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    token: localStorage.getItem('homely_token') || null,
    isAuthenticated: !!localStorage.getItem('homely_token'),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('homely_token');
      localStorage.removeItem('homely_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('homely_user', JSON.stringify(action.payload));
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('homely_user', JSON.stringify(action.payload));
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = action.payload;
          localStorage.setItem('homely_user', JSON.stringify(state.user));
        }
      });
  }
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
