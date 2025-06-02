import { configureStore } from '@reduxjs/toolkit';
import warehouseReducer from './warehouse';
import stageReducer from './stage';
import session from './session';
import printReducer from './print';
import rackReducer from './rack';
import logger from 'redux-logger';

const isDev = process.env.NODE_ENV !== "production";

export default configureStore({
  reducer: {
    warehouse: warehouseReducer,
    stage: stageReducer,
    session,
    print: printReducer,
    rack: rackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    isDev
      ? getDefaultMiddleware().concat(logger)
      : getDefaultMiddleware(),
});