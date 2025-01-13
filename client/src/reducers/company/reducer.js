import { handleActions } from 'redux-actions';
import {
  GETCOMPANYDATA,
  UPDATECOMPANYDATA,
  UPLOADCOMPANYLOGO,
} from './constants';
import { getToken } from '../../_helpers/token-helpers';

import { REQUEST_STATUS } from '../../_config/constants';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';

const initialState = {
  companyData: {},
  error: {},
  state: REQUEST_STATUS.INITIAL,
  companyLogo: '',
  uploadState: REQUEST_STATUS.INITIAL,
};

/* Action creators */
export const {
  start: getCompany,
  success: getCompanySuccess,
  fail: getCompanyFail,
} = defineLoopActions(GETCOMPANYDATA);

export const {
  start: updateCompany,
  success: updateCompanySuccess,
  fail: updateCompanyFail,
} = defineLoopActions(UPDATECOMPANYDATA);

export const {
  start: uploadLogo,
  success: uploadLogoSuccess,
  fail: uploadLogoFail,
} = defineLoopActions(UPLOADCOMPANYLOGO);

export const fetchCompanyData = id => {
  const apiUrl = `/api/company/${id}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getCompany,
    onSuccess: getCompanySuccess,
    onFailure: getCompanyFail,
    label: GETCOMPANYDATA,
  });
};

export const updateCompanyData = (data, id) => {
  const apiUrl = `/api/company/update/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: updateCompany,
    onSuccess: updateCompanySuccess,
    onFailure: updateCompanyFail,
    data: data,
    label: UPDATECOMPANYDATA,
  });
};

export const uploadCompanyLogo = (data, id) => {
  const apiUrl = `/api/images/companylogo/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: uploadLogo,
    onSuccess: uploadLogoSuccess,
    onFailure: uploadLogoFail,
    data: data,
    label: UPLOADCOMPANYLOGO,
  });
};

export const companyReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: UPDATECOMPANYDATA,
      onSuccess: (state, payload) => {
        return {
          ...state,
          companyData: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: GETCOMPANYDATA,
      onSuccess: (state, payload) => {
        return {
          ...state,
          companyData: payload,
          companyLogo: payload.companyLogo,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: UPLOADCOMPANYLOGO,
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
          companyLogo: payload,
          uploadState: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
  },
  initialState
);
