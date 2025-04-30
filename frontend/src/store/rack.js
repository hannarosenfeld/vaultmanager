import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Action Types
const SET_RACKS = 'rack/SET_RACKS';
const ADD_RACK = 'rack/ADD_RACK';
const UPDATE_RACK_POSITION = 'rack/UPDATE_RACK_POSITION';

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
  console.log(`🔍 Fetching racks for warehouseId: ${warehouseId}`);
  try {
    const response = await fetch(`/api/warehouse/${warehouseId}/racks`);
    console.log(`🔍 Response status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Fetched racks data:`, data);
      dispatch(setRacks(data));
    } else {
      const errorText = await response.text(); // Capture the full response text for debugging
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
        width: newRack.position.width, // Ensure width is included
        length: newRack.position.length, // Ensure length is included
        num_shelves: newRack.num_shelves, // Include the number of shelves
      }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(addRack(data));
      console.log('✅ Rack added successfully:', data);
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

// Add Pallet Thunk
export const addPalletThunk = createAsyncThunk(
  "rack/addPallet",
  async ({ shelfId, customer_name, pallet_number, notes }, { dispatch, rejectWithValue }) => {
    console.log(`🔍 Adding pallet to shelfId: ${shelfId}`);
    try {
      const response = await axios.post(`/api/pallets/shelf/${shelfId}/add`, {
        customer_name,
        pallet_number,
        notes,
      });
      console.log(`✅ Pallet added successfully. Response:`, response.data);
      const updatedShelf = response.data;
      dispatch(fetchRacksThunk(updatedShelf.warehouseId)); // Refresh racks
      return updatedShelf;
    } catch (error) {
      console.error('❌ Error adding pallet:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Failed to add pallet");
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

// Initial State
const initialState = {
  racks: [],
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

    default:
      return state;
  }
};

export default rackReducer;
