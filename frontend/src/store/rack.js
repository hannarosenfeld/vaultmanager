// Action Types
const SET_RACKS = 'rack/SET_RACKS';
const UPDATE_RACK_POSITION = 'rack/UPDATE_RACK_POSITION';

// Action Creators
export const setRacks = (racks) => ({
  type: SET_RACKS,
  racks,
});

export const updateRackPosition = (rackId, updatedPosition) => ({
  type: UPDATE_RACK_POSITION,
  payload: { rackId, updatedPosition },
});

// Thunks
export const moveRackThunk = (warehouseId, rackId, updatedPosition) => async (dispatch) => {
  console.log("🚚 Moving rack...", warehouseId, rackId, updatedPosition);
  try {
    const response = await fetch(`/api/warehouse/${warehouseId}/rack/${rackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position: updatedPosition }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(updateRackPosition(rackId, updatedPosition));
      console.log('✅ Rack position updated successfully:', data);
    } else {
      const error = await response.json();
      console.error('❌ Error updating rack position:', error);
    }
  } catch (error) {
    console.error('❌ Error updating rack position:', error);
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

    case UPDATE_RACK_POSITION:
      return {
        ...state,
        racks: state.racks.map((rack) =>
          rack.id === action.payload.rackId
            ? { ...rack, position: action.payload.updatedPosition }
            : rack
        ),
      };

    default:
      return state;
  }
};

export default rackReducer;
