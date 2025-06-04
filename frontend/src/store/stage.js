import { updateWarehouseAfterStaging, DELETE_VAULT } from './warehouse';

// Action Types
const GET_ALL_STAGED_VAULTS = "stage/GET_ALL_STAGED_VAULTS";
const STAGE_VAULT = "stage/STAGE_VAULT";
const REMOVE_VAULT_FROM_STAGE = "stage/REMOVE_VAULT_FROM_STAGE";
const SET_STAGE_LOADING = "stage/SET_STAGE_LOADING";
const SET_STAGE_ERROR = "stage/SET_STAGE_ERROR";

// Action Creators
export const getAllStagedVaults = (vaults) => ({
  type: GET_ALL_STAGED_VAULTS,
  vaults,
});

export const stageVault = (vault) => ({
  type: STAGE_VAULT,
  vault,
});

export const removeVaultFromStage = (vaultId) => ({
  type: REMOVE_VAULT_FROM_STAGE,
  vaultId,
});

export const setStageLoading = (loading) => ({
  type: SET_STAGE_LOADING,
  loading,
});

export const setStageError = (error) => ({
  type: SET_STAGE_ERROR,
  error,
});


export const getAllStagedVaultsThunk = (companyId) => async (dispatch, getState) => {
  dispatch(setStageLoading(true));
  dispatch(setStageError(null));
  try {
    const response = await fetch(`/api/stage/vaults`);
    if (response.ok) {
      const data = await response.json();
      const vaultsArr = Object.values(data);
      dispatch(getAllStagedVaults(vaultsArr));
    } else {
      const errorText = await response.text();
      dispatch(setStageError(errorText));
    }
  } catch (error) {
    dispatch(setStageError(error.message));
  } finally {
    dispatch(setStageLoading(false));
  }
};

// export const getAllStagedVaultsThunk = (companyId) => async (dispatch, getState) => {
//   console.log("❤️ INTHUNK", companyId)
//   dispatch(setStageLoading(true));
//   dispatch(setStageError(null));
//   try {
//     const response = await fetch(`/api/stage/vaults/${companyId}`);
//     if (response.ok) {
//       const data = await response.json();
//       const vaultsArr = Object.values(data);
//       dispatch(getAllStagedVaults(vaultsArr));
//     } else {
//       const errorText = await response.text();
//       dispatch(setStageError(errorText));
//     }
//   } catch (error) {
//     dispatch(setStageError(error.message));
//   } finally {
//     dispatch(setStageLoading(false));
//   }
// };

export const stageVaultThunk = (vaultId) => async (dispatch) => {
  dispatch(setStageLoading(true));
  dispatch(setStageError(null));
  try {
    const response = await fetch(`/api/stage/vaults/${vaultId}`, {
      method: 'POST',
    });
    if (response.ok) {
      const data = await response.json();
      dispatch(stageVault(data));
      dispatch(updateWarehouseAfterStaging(data));
    } else {
      const errorText = await response.text();
      dispatch(setStageError(errorText));
    }
  } catch (error) {
    dispatch(setStageError(error.message));
  } finally {
    dispatch(setStageLoading(false));
  }
};

// Initial State
const initialState = {
  stagedVaults: {},
  loading: false,
  error: null,
};

// Reducer
export default function stageReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_STAGED_VAULTS:
      // action.vaults is an array
      const stagedVaults = {};
      action.vaults.forEach((vault) => {
        stagedVaults[vault.id] = vault;
      });
      return {
        ...state,
        stagedVaults,
      };
    case STAGE_VAULT:
      return {
        ...state,
        stagedVaults: {
          ...state.stagedVaults,
          [action.vault.id]: action.vault,
        },
      };
    case REMOVE_VAULT_FROM_STAGE:
      const { [action.vaultId]: _, ...remainingVaults } = state.stagedVaults;
      return {
        ...state,
        stagedVaults: remainingVaults,
      };
    case SET_STAGE_LOADING:
      return {
        ...state,
        loading: action.loading,
      };
    case SET_STAGE_ERROR:
      return {
        ...state,
        error: action.error,
      };
    case DELETE_VAULT:
      if (action.payload.deleteFrom === "stage") {
        const { [action.payload.vaultId]: __, ...rest } = state.stagedVaults;
        return {
          ...state,
          stagedVaults: rest,
        };
      }
      return state;
    default:
      return state;
  }
}