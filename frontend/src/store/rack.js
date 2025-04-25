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
export const fetchRacksThunk = (warehouseId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/warehouse/${warehouseId}/racks`);
    if (response.ok) {
      const data = await response.json();
      dispatch(setRacks(data));
    } else {
      console.error('❌ Error fetching racks:', await response.json());
    }
  } catch (error) {
    console.error('❌ Error fetching racks:', error);
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
  };

  try {
    const response = await fetch(`/api/racks/${warehouseId}/rack/${rackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position }), // Only send position
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(updateRackPosition(rackId, position)); // Only update position in Redux
      console.log('✅ Rack position updated successfully:', data);
    } else {
      const error = await response.json();
      console.error('❌ Error updating rack position:', error);
    }
  } catch (error) {
    console.error('❌ Error updating rack position:', error);
  }
};

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
      console.log("✅ Rack position updated successfully:", data);
      return data;
    } else {
      const error = await response.json();
      console.error("❌ Error updating rack position:", error);
      return error;
    }
  } catch (error) {
    console.error("❌ Error updating rack position:", error);
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
