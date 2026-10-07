import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { RANDOM_STAYS } from '../../data/mockStays';

export const fetchProperties = createAsyncThunk('properties/fetchAll', async (params = {}) => {
  try {
    const res = await api.get('/properties', { params });
    if (res.data && res.data.properties && res.data.properties.length > 0) {
      return res.data;
    }
    // If backend returned 0 properties and no filters were applied, fallback to RANDOM_STAYS
    if (!params.city && (!params.propertyType || params.propertyType === 'all') && !params.search) {
      return {
        success: true,
        properties: RANDOM_STAYS,
        pagination: { total: RANDOM_STAYS.length, page: 1, pages: 1, limit: 12 }
      };
    }
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using fallback stays:', err.message);
    let filtered = [...RANDOM_STAYS];
    if (params.city) {
      const qCity = params.city.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.location?.city?.toLowerCase().includes(qCity) ||
        p.location?.state?.toLowerCase().includes(qCity) ||
        p.title?.toLowerCase().includes(qCity)
      );
    }
    if (params.propertyType && params.propertyType !== 'all') {
      filtered = filtered.filter(p => p.propertyType?.toLowerCase() === params.propertyType.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.location?.city?.toLowerCase().includes(q)
      );
    }
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      properties: paginated,
      pagination: {
        total: filtered.length,
        page,
        pages: Math.ceil(filtered.length / limit) || 1,
        limit
      }
    };
  }
});

export const fetchPropertyById = createAsyncThunk('properties/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/properties/${id}`);
    return res.data.property;
  } catch (err) {
    const fallback = RANDOM_STAYS.find(p => p._id === id);
    if (fallback) return fallback;
    return rejectWithValue(err.response?.data?.message || 'Property not found');
  }
});

export const fetchHostProperties = createAsyncThunk('properties/fetchHost', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/properties/host/my-properties');
    return res.data.properties;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
  }
});

export const createProperty = createAsyncThunk('properties/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.property;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create');
  }
});

export const updateProperty = createAsyncThunk('properties/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.property;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update');
  }
});

export const deleteProperty = createAsyncThunk('properties/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/properties/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete');
  }
});

const propertySlice = createSlice({
  name: 'properties',
  initialState: {
    properties: [],
    hostProperties: [],
    selectedProperty: null,
    pagination: null,
    loading: false,
    detailLoading: false,
    error: null,
    filters: {
      search: '',
      city: '',
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      amenities: [],
      sort: 'newest'
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        city: '',
        propertyType: 'all',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        amenities: [],
        sort: 'newest'
      };
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchPropertyById.pending, (state) => { 
        state.detailLoading = true; 
        state.selectedProperty = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => { 
        state.detailLoading = false; 
        state.selectedProperty = null;
        state.error = action.payload; 
      })

      .addCase(fetchHostProperties.fulfilled, (state, action) => {
        state.hostProperties = action.payload;
      })

      .addCase(createProperty.fulfilled, (state, action) => {
        state.hostProperties.unshift(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const idx = state.hostProperties.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.hostProperties[idx] = action.payload;
        if (state.selectedProperty?._id === action.payload._id) state.selectedProperty = action.payload;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.hostProperties = state.hostProperties.filter(p => p._id !== action.payload);
      });
  }
});

export const { setFilters, clearFilters, clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;
