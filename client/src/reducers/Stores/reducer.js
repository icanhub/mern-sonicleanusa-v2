import { createAction, handleActions } from 'redux-actions';
import {
  SUCCESS_SAVE_STORES,
  FAILURE_FETCH_STORES,
  GETSTORES,
  DELETESTORE,
  ADDSTORE,
  UPDATESTORE,
} from './constants';
import { REQUEST_STATUS } from '../../_config/constants';
import { getToken } from '../../_helpers/token-helpers';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';
const initialState = {
  storesData: [],
  storebyId: [],
  fetching_state: REQUEST_STATUS.INITIAL,
  posting_state: REQUEST_STATUS.INITIAL,
  deleting_state: REQUEST_STATUS.INITIAL,
};

/* Action creators */
export const {
  start: addStore,
  success: addStoreSuccess,
  fail: addStoreFail,
} = defineLoopActions(ADDSTORE);

export const {
  start: getStores,
  success: getStoresSuccess,
  fail: getStoresFail,
} = defineLoopActions(GETSTORES);

export const {
  start: updateStore,
  success: updateStoreSuccess,
  fail: updateStoreFail,
} = defineLoopActions(UPDATESTORE);

export const {
  start: deleteStore,
  success: deleteStoreSuccess,
  fail: deleteStoreFail,
} = defineLoopActions(DELETESTORE);

export const successSaveStores = createAction(SUCCESS_SAVE_STORES);
export const failurefetchstore = createAction(FAILURE_FETCH_STORES);

/* Actions  */
export const fetchStores = id => {
  const apiUrl = `/api/store/list/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getStores,
    onSuccess: getStoresSuccess,
    onFailure: getStoresFail,
    label: GETSTORES,
  });
};

export const savestore = (data, id) => {
  const apiUrl = `/api/store/add/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    data: data,
    onStart: addStore,
    onSuccess: addStoreSuccess,
    onFailure: addStoreFail,
    label: ADDSTORE,
  });
};

export const putstore = (data, id, dealer) => {
  const apiUrl = `/api/store/update/${id}/${dealer}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    data: data,
    onStart: updateStore,
    onSuccess: updateStoreSuccess,
    onFailure: updateStoreFail,
    label: UPDATESTORE,
  });
};

export const deleteStoreRequest = (id, dealer) => {
  const apiUrl = `/api/store/delete/${id}/${dealer}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteStore,
    onSuccess: deleteStoreSuccess,
    onFailure: deleteStoreFail,
    label: DELETESTORE,
  });
};

/* Reducers  */
export const StoreReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: ADDSTORE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          storesData: payload,
          posting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'posting_state',
    }),

    ...requestLoopHandlers({
      action: UPDATESTORE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          storesData: payload,
          posting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'posting_state',
    }),

    ...requestLoopHandlers({
      action: GETSTORES,
      onSuccess: (state, payload) => {
        return {
          ...state,
          storesData: payload,
          fetching_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'fetching_state',
    }),

    ...requestLoopHandlers({
      action: DELETESTORE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          storesData: payload,
          deleting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'deleting_state',
    }),
  },
  initialState
);
