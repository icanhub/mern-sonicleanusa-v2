import { compose, legacy_createStore as createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
// import apiMiddleware from 'middleware/api';
import apiMiddleware from '../middleware/api';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  saveSubsetBlacklistFilter,
  saveSubsetSalesFormBlacklistFilter,
  saveStoresBlacklistFilter,
  saveCardBlacklistFilter,
  saveUsersBlacklistFilter,
} from './fieldFilterTransform';

export default function configureStore(preloadedState) {
  const middlewares = [thunk, apiMiddleware];

  const enhancers = [applyMiddleware(...middlewares)];

  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['orderhistory'],
    transforms: [
      saveSubsetBlacklistFilter,
      saveSubsetSalesFormBlacklistFilter,
      saveStoresBlacklistFilter,
      saveCardBlacklistFilter,
      saveUsersBlacklistFilter,
    ],
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = createStore(persistedReducer, composeEnhancers(...enhancers));

  let persistor = persistStore(store);

  return { store, persistor };
}

export const { store, persistor } = configureStore();
