import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch all vaults
export const fetchAllVaults = createAsyncThunk(
  'print/fetchAllVaults',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/vaults/all');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        console.error("Error fetching vaults:", errorData.errors);
        return rejectWithValue(errorData.errors);
      }
    } catch (error) {
      console.error("Error fetching vaults:", error);
      return rejectWithValue(error.message);
    }
  }
);

const printSlice = createSlice({
  name: 'print',
  initialState: {
    vaults: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVaults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllVaults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vaults = action.payload;
      })
      .addCase(fetchAllVaults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default printSlice.reducer;