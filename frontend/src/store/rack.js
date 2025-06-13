import { createAsyncThunk } from "@reduxjs/toolkit";

// Action Types
const SET_RACKS = 'rack/SET_RACKS';
const ADD_RACK = 'rack/ADD_RACK';
const UPDATE_RACK_POSITION = 'rack/UPDATE_RACK_POSITION';
const DELETE_PALLET = "rack/DELETE_PALLET";
const SET_CURRENT_RACK = "rack/SET_CURRENT_RACK"; // New action type
const DELETE_RACK = "rack/DELETE_RACK";

// Action Creators
export const setRacks = (racks) => ({
  type: SET_RACKS,
  racks,
});

export const addRack = (rack) => ({
  type: ADD_RACK,
  rack,
});

export const updateRackPosition = (rackId, updatedPosition) => ({
  type: UPDATE_RACK_POSITION,
  payload: { rackId, updatedPosition },
});

export const deletePallet = (palletId) => ({
  type: DELETE_PALLET,
  payload: palletId,
});

export const setCurrentRack = (rack) => ({
  type: SET_CURRENT_RACK,
  payload: rack,
});

export const deleteRack = (rackId) => ({
  type: DELETE_RACK,
  payload: rackId,
});

// Thunks
export const fetchRacksThunk = (warehouseId) => async (dispatch, getState) => {
  if (!warehouseId) {
    const state = getState();
    warehouseId = state.warehouse.currentWarehouse?.id;
    if (!warehouseId) {
      console.error("❌ fetchRacksThunk called with undefined warehouseId");
      return;
    }
  }
  try {
    const response = await fetch(`/api/racks/warehouse/${warehouseId}`);
    if (response.ok) {
      const data = await response.json();
      dispatch(setRacks(data));
      // Optionally update currentRack if needed
      const state = getState();
      const prevCurrentRack = state.rack.currentRack;
      if (prevCurrentRack) {
        const updatedRack = data.find(r => r.id === prevCurrentRack.id);
        if (updatedRack) {
          dispatch(setCurrentRack(updatedRack));
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error fetching racks:', errorText);
      throw new Error(`Failed to fetch racks: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error fetching racks:', error.message);
  }
};

export const addRackThunk = (warehouseId, newRack) => async (dispatch) => {
  try {
    const response = await fetch(`/api/racks/warehouse/${warehouseId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newRack,
        width: newRack.position.width,
        length: newRack.position.length,
        num_shelves: newRack.num_shelves,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(addRack(data));
    } else {
      console.error('❌ Error adding rack:', await response.json());
    }
  } catch (error) {
    console.error('❌ Error adding rack:', error);
  }
};

export const moveRackThunk = (warehouseId, rackId, updatedPosition) => async (dispatch) => {
  const position = {
    x: updatedPosition.x || 0,
    y: updatedPosition.y || 0,
    width: updatedPosition.width || 1, // Ensure width is included
    length: updatedPosition.length || 1, // Ensure length is included
  };

  try {
    const response = await fetch(`/api/racks/${warehouseId}/rack/${rackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position }), // Send position with dimensions
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(updateRackPosition(rackId, position)); // Update position in Redux
    } else {
      const error = await response.json();
    }
  } catch (error) {
    console.error('❌ Error updating rack position:', error);
  }
};


// Edit Pallet Thunk
export const editPalletThunk = createAsyncThunk(
  "rack/editPallet",
  async (palletData, { rejectWithValue }) => {
    console.log("❤️ pallet data: ", palletData);
    try {
      // FIX: Use the correct route prefix for the rack_routes blueprint
      const response = await fetch(`/api/racks/pallets/${palletData.id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(palletData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error editing pallet:", errorData);
        return rejectWithValue(errorData || "Failed to edit pallet");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error editing pallet:", error);
      return rejectWithValue(error || "Failed to edit pallet");
    }
  }
);

// Delete Pallet Thunk
export const deletePalletThunk = createAsyncThunk(
  "rack/deletePallet",
  async (palletId, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/pallets/${palletId}/delete`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error deleting pallet:", errorData);
        return rejectWithValue(errorData || "Failed to delete pallet");
      }
      const data = await response.json();
      dispatch(deletePallet(palletId));
      // Update currentRack in state after deletion
      const state = getState();
      const racks = state.rack.racks;
      const currentRack = state.rack.currentRack;
      if (currentRack) {
        const updatedRack = racks.find(r => r.id === currentRack.id);
        if (updatedRack) {
          dispatch(setCurrentRack(updatedRack));
        }
      }
      return data;
    } catch (error) {
      console.error("❌ Error deleting pallet:", error);
      return rejectWithValue(error || "Failed to delete pallet");
    }
  }
);

export const updateRackPositionThunk = (warehouseId, rackId, position) => async (dispatch) => {
  // Ensure all required fields are included in the position object
  const validatedPosition = {
    x: position.x || 0,
    y: position.y || 0,
    width: position.width || 0,
    length: position.length || 0, // Corrected from height
  };

  try {
    const response = await fetch(`/api/racks/${warehouseId}/rack/${rackId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position: validatedPosition }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      return error;
    }
  } catch (error) {
    return error;
  }
};

// Add Pallet Thunk
export const addPalletThunk = createAsyncThunk(
  "rack/addPallet",
  async (palletData, { rejectWithValue }) => {
    console.log("addPalletThunk payload:", palletData); // Log the payload
    try {
      const response = await fetch("/api/racks/pallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(palletData), // palletData should include slot_index
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData || "Failed to add pallet");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to add pallet");
    }
  }
);

// Thunk to delete a rack
export const deleteRackThunk = ({ warehouseId, rackId }) => async (dispatch) => {
  try {
    const response = await fetch(`/api/racks/${warehouseId}/rack/${rackId}/delete`, {
      method: "DELETE",
    });
    if (response.ok) {
      dispatch(deleteRack(rackId));
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete rack");
    }
  } catch (error) {
    console.error("❌ Error deleting rack:", error);
    throw error;
  }
};

// Initial State
const initialState = {
  racks: [],
  currentRack: null, // Add currentRack to state
};

// Reducer
const rackReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RACKS:
      return {
        ...state,
        racks: action.racks,
      };

    case ADD_RACK:
      return {
        ...state,
        racks: [...state.racks, action.rack],
      };

    case UPDATE_RACK_POSITION:
      return {
        ...state,
        racks: state.racks.map((rack) =>
          rack.id === action.payload.rackId
            ? { ...rack, position: { ...rack.position, ...action.payload.updatedPosition } } // Ensure orientation is updated
            : rack
        ),
      };

    case DELETE_PALLET:
      return {
        ...state,
        racks: state.racks.map((rack) => ({
          ...rack,
          shelves: rack.shelves.map((shelf) => ({
            ...shelf,
            pallets: shelf.pallets.filter((pallet) => pallet.id !== action.payload),
          })),
        })),
      };

    case SET_CURRENT_RACK:
      return {
        ...state,
        currentRack: action.payload,
      };

    case DELETE_RACK:
      return {
        ...state,
        racks: state.racks.filter((rack) => rack.id !== action.payload),
      };

    case "rack/editPallet/fulfilled": {
      const updatedPallet = action.payload;
      return {
        ...state,
        racks: state.racks.map((rack) => ({
          ...rack,
          shelves: rack.shelves.map((shelf) => ({
            ...shelf,
            pallets: shelf.pallets.map((pallet) =>
              pallet.id === updatedPallet.id ? { ...pallet, ...updatedPallet } : pallet
            ),
          })),
        })),
        currentRack: state.currentRack
          ? {
              ...state.currentRack,
              shelves: state.currentRack.shelves.map((shelf) => ({
                ...shelf,
                pallets: shelf.pallets.map((pallet) =>
                  pallet.id === updatedPallet.id ? { ...pallet, ...updatedPallet } : pallet
                ),
              })),
            }
          : state.currentRack,
      };
    }

    default:
      return state;
  }
};

export default rackReducer;
