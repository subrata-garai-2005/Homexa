import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMyBookings = createAsyncThunk('bookings/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/my-bookings');
    return res.data.bookings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const fetchHostBookings = createAsyncThunk('bookings/fetchHost', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/host-bookings');
    return res.data.bookings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch host bookings');
  }
});

export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings', data);
    return res.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Booking failed');
  }
});

export const fetchBookingById = createAsyncThunk('bookings/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${id}`);
    return res.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking');
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cancel failed');
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}/status`, { status });
    return res.data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings: [],
    hostBookings: [],
    selectedBooking: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedBooking: (state) => { state.selectedBooking = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => { state.loading = false; state.myBookings = action.payload; })
      .addCase(fetchMyBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchHostBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchHostBookings.fulfilled, (state, action) => { state.loading = false; state.hostBookings = action.payload; })
      .addCase(fetchHostBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createBooking.fulfilled, (state, action) => { state.myBookings.unshift(action.payload); })

      .addCase(fetchBookingById.pending, (state) => { 
        state.loading = true; 
        state.selectedBooking = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => { state.loading = false; state.selectedBooking = action.payload; })
      .addCase(fetchBookingById.rejected, (state, action) => { 
        state.loading = false; 
        state.selectedBooking = null;
        state.error = action.payload; 
      })

      .addCase(cancelBooking.pending, (state) => { state.loading = true; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updateList = (list) => list.map(b => b._id === action.payload._id ? action.payload : b);
        state.myBookings = updateList(state.myBookings);
        state.hostBookings = updateList(state.hostBookings);
        if (state.selectedBooking?._id === action.payload._id) state.selectedBooking = action.payload;
      })
      .addCase(cancelBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updateList = (list) => list.map(b => b._id === action.payload._id ? action.payload : b);
        state.myBookings = updateList(state.myBookings);
        state.hostBookings = updateList(state.hostBookings);
        if (state.selectedBooking?._id === action.payload._id) state.selectedBooking = action.payload;
      });
  }
});

export const { clearSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
