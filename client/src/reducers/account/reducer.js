import { handleActions } from 'redux-actions';
import { GETACCOUNTDATA, UPDATEACCOUNTDATA, UPLOADPHOTO } from './constants';
import { getToken } from '../../_helpers/token-helpers';

import { REQUEST_STATUS } from '../../_config/constants';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';

const initialState = {
  accountData: {},
  error: {},
  state: REQUEST_STATUS.INITIAL,
  fetching_state: REQUEST_STATUS.INITIAL,
  userPhoto: '',
  uploadState: REQUEST_STATUS.INITIAL,
};

/* Action creators */
export const {
  start: getAccount,
  success: getAccountSuccess,
  fail: getAccountFail,
  end: resetState,
} = defineLoopActions(GETACCOUNTDATA);

export const {
  start: updateAccount,
  success: updateAccountSuccess,
  fail: updateAccountFail,
} = defineLoopActions(UPDATEACCOUNTDATA);

export const {
  start: uploadPhoto,
  success: uploadPhotoSuccess,
  fail: uploadPhotoFail,
} = defineLoopActions(UPLOADPHOTO);

export const fetchAccountData = id => {
  const apiUrl = `/api/account/${id}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getAccount,
    onSuccess: getAccountSuccess,
    onFailure: getAccountFail,
    label: GETACCOUNTDATA,
  });
};

export const updateAccountData = (data, id) => {
  const apiUrl = `/api/account/update/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: updateAccount,
    onSuccess: updateAccountSuccess,
    onFailure: updateAccountFail,
    data: data,
    label: UPDATEACCOUNTDATA,
  });
};

export const uploadAccountPhto = (image, id) => {
  let data = {
    file: image,
  };

  const apiUrl = `/api/images/userphoto/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: uploadPhoto,
    onSuccess: uploadPhotoSuccess,
    onFailure: uploadPhotoFail,
    data: data,
    label: UPLOADPHOTO,
  });
};

export const accountReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: UPDATEACCOUNTDATA,
      onSuccess: (state, payload) => {
        return {
          ...state,
          accountData: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: GETACCOUNTDATA,
      onSuccess: (state, payload) => {
        return {
          ...state,
          accountData: payload,
          userPhoto: payload.userPhoto,
          error: {},
          fetching_state: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          accountData: {},
          error: payload,
          fetching_state: REQUEST_STATUS.FAIL,
        };
      },
      stateField: 'fetching_state',
    }),

    ...requestLoopHandlers({
      action: UPLOADPHOTO,
      onStart: (state, payload) => {
        return {
          ...state,
          uploadState: REQUEST_STATUS.PENDING,
        };
      },
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          userPhoto: payload,
          uploadState: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
  },
  initialState
);
