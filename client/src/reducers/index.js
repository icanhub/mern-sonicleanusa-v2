import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { authReducer } from './auth';
import { accountReducer } from './account';
import { companyReducer } from './company';
import { SalesFormReducer } from './salesForm';
import { UserReducer } from './Users';
import { StoreReducer } from './Stores';
import { CardReducer } from './cards';
import { OrderHistoryReducer } from './OrderHistory';
import { NotificationReducer } from './Notification';
import { officialReducer } from './official';
import { managerReducer } from './manager';

import storage from 'redux-persist/lib/storage';

const appReducers = combineReducers({
  auth: authReducer,
  account: accountReducer,
  company: companyReducer,
  salesform: SalesFormReducer,
  stores: StoreReducer,
  card: CardReducer,
  orderhistory: OrderHistoryReducer,
  users: UserReducer,
  notification: NotificationReducer,
  official: officialReducer,
  manager: managerReducer,
  // but its referenced here
});

const initialState = appReducers({}, {});

const VisualbitlizerApp = (state, action) => {
  if (action.type === 'soniclean/auth/logout') {
    state = initialState;
  }
  return appReducers(state, action);
};

export default VisualbitlizerApp;
