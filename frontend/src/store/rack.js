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
      body: JSON.stringify(newRack),
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
  try {
    const response = await fetch(`/api/racks/${warehouseId}/rack/${rackId}`, {
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
      console.error('❌ Error updating rack position:', await response.json());
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
            ? { ...rack, position: action.payload.updatedPosition }
            : rack
        ),
      };

    default:
      return state;
  }
};

export default rackReducer;
