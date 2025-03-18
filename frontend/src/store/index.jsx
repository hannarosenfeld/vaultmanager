import { configureStore } from '@reduxjs/toolkit';
import warehouseReducer from './warehouse';
import stageReducer from './stage';
import session from './session';
import printReducer from './print';
import logger from 'redux-logger';

export default configureStore({
  reducer: {
    warehouse: warehouseReducer,
    stage: stageReducer,
    session,
    print: printReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});