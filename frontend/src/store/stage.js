import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { updateWarehouseAfterStaging, DELETE_VAULT } from './warehouse';

const GET_ALL_STAGED_VAULTS = "warehouse/GET_ALL_STAGED_VAULTS";
const STAGE_VAULT = "warehouse/STAGE_VAULT";
const REMOVE_VAULT_FROM_STAGE = "stage/REMOVE_VAULT_FROM_STAGE"; // New action type

export const getAllStagedVaultsThunk = createAsyncThunk(
  GET_ALL_STAGED_VAULTS,
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stage/vaults');
      if (!response.ok) {
        throw new Error('Failed to fetch staged vaults');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const stageVaultThunk = createAsyncThunk(
  STAGE_VAULT,
  async (vaultId, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stage/vaults/${vaultId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to stage vault');
      }
      const data = await response.json();
      dispatch(updateWarehouseAfterStaging(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeVaultFromStage = (vaultId) => ({
  type: REMOVE_VAULT_FROM_STAGE,
  payload: { vaultId },
});

const initialState = {
  stagedVaults: {},
  loading: false,
  error: null,
};

const stageSlice = createSlice({
  name: 'stage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllStagedVaultsThunk.fulfilled, (state, action) => {
        const newStagedVaults = action.payload.reduce((acc, vault) => {
          acc[vault.id] = vault;
          return acc;
        }, {});
        state.stagedVaults = newStagedVaults;
      })
      .addCase(stageVaultThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stageVaultThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stagedVaults[action.payload.id] = action.payload;
      })
      .addCase(stageVaultThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(DELETE_VAULT, (state, action) => {
        const { vaultId, deleteFrom } = action.payload;
        if (deleteFrom === "stage") {
          delete state.stagedVaults[vaultId];
        }
      })
      .addCase(REMOVE_VAULT_FROM_STAGE, (state, action) => {
        delete state.stagedVaults[action.payload.vaultId];
      });
  },
});

export default stageSlice.reducer;