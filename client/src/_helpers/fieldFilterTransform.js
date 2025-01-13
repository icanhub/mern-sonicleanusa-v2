import { createBlacklistFilter } from 'redux-persist-transform-filter';
// import { authBlacklistedFields } from '../modules/auth/reducer';
import { authBlacklistedFields } from '../reducers/auth';
export const saveSubsetBlacklistFilter = createBlacklistFilter(
  'auth',
  authBlacklistedFields.map(item => item)
);

export const saveSubsetSalesFormBlacklistFilter = createBlacklistFilter(
  'salesform',
  ['state']
);

export const saveStoresBlacklistFilter = createBlacklistFilter('stores', [
  'fetching_state',
  'posting_state',
  'deleting_state',
]);

export const saveCardBlacklistFilter = createBlacklistFilter('card', [
  'fetching_state',
  'posting_state',
  'deleting_state',
  'error',
]);

export const saveUsersBlacklistFilter = createBlacklistFilter('users', [
  'fetching_state',
  'posting_state',
  'deleting_state',
]);
