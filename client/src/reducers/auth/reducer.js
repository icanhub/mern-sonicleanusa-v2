import { handleActions, createAction } from 'redux-actions';
import jwt_decode from 'jwt-decode';
import { setToken, getToken, removeToken } from '../../_helpers/token-helpers';
import { REQUEST_STATUS } from '../../_config/constants';

import setAuthToken from '../../utils/setAuthToken';

import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';

import {
  LOGIN,
  ACCEPTNEWPRICE,
  REGISTER,
  VACUUMREGISTER,
  LOGOUT,
  RESTPASSWORD,
  RESTPASSWORDEMAIL,
} from './constants';

const initialState = {
  token: '',
  isLoggedIn: false,
  user: {},
  registerState: REQUEST_STATUS.INITIAL,
  loginState: REQUEST_STATUS.INITIAL,
  resetPasswordState: REQUEST_STATUS.INITIAL,
  error: {},
};

export const authBlacklistedFields = [
  'loginState',
  'registerState',
  'resetPasswordState',
];

export const {
  start: register,
  success: registerSuccess,
  fail: registerFail,
  reset: registerResetState,
} = defineLoopActions(REGISTER);

export const {
  start: vacuumregister,
  success: vacuumregisterSuccess,
  fail: vacuumregisterFail,
  reset: vacuumregisterResetState,
} = defineLoopActions(VACUUMREGISTER);

export const {
  start: login,
  success: loginSuccess,
  fail: loginFail,
  reset: resetState,
} = defineLoopActions(LOGIN);

export const {
  start: resetPassword,
  success: resetPasswordSuccess,
  fail: resetPasswordFail,
} = defineLoopActions(RESTPASSWORD);

export const {
  start: resetPasswordEmail,
  success: resetPasswordEmailSuccess,
  fail: resetPasswordEmailFail,
  reset: resetPasswordEmailState,
} = defineLoopActions(RESTPASSWORDEMAIL);

export const logout = createAction(LOGOUT);

export const fetchRegister = data => {
  // const appBaseURL = process.env.REACT_APP_API_URL;
  const apiUrl = `/api/users/register`;

  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: register,
    onSuccess: registerSuccess,
    onFailure: registerFail,
    label: REGISTER,
  });
};

export const fetchVacuumRegister = data => {
  // const appBaseURL = process.env.REACT_APP_API_URL;
  const apiUrl = `/api/users/vacuumregister`;

  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: vacuumregister,
    onSuccess: vacuumregisterSuccess,
    onFailure: vacuumregisterFail,
    label: VACUUMREGISTER,
  });
};

export const fetchLogin = data => {
  // const appBaseURL = process.env.REACT_APP_API_URL;
  const apiUrl = `/api/users/login`;

  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: login,
    onSuccess: loginSuccess,
    onFailure: loginFail,
    label: LOGIN,
  });
};

export const updateNewPrice = id => {
  const apiUrl = `/api/users/updatePrice/${id}`;
  const token = getToken();

  let userData;
  userData = apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: login,
    onSuccess: loginSuccess,
    onFailure: loginFail,
    label: ACCEPTNEWPRICE,
  });
  return userData;
};

export const fetchResetPassword = data => {
  const apiUrl = `/api/users/confirmation`;

  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: resetPassword,
    onSuccess: resetPasswordSuccess,
    onFailure: resetPasswordFail,
    label: RESTPASSWORD,
  });
};

export const fetchResetPasswordEmail = data => {
  const apiUrl = `/api/users/resetpassword`;

  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: resetPasswordEmail,
    onSuccess: resetPasswordEmailSuccess,
    onFailure: resetPasswordEmailFail,
    label: RESTPASSWORDEMAIL,
  });
};

export const authReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: REGISTER,
      onStart: (state, payload) => {
        return {
          ...state,
          registerState: REQUEST_STATUS.PENDING,
        };
      },
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          registerState: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          error: payload,
          registerState: REQUEST_STATUS.FAIL,
        };
      },
      initialValue: initialState,
    }),

    ...requestLoopHandlers({
      action: VACUUMREGISTER,
      onStart: (state, payload) => {
        return {
          ...state,
          registerState: REQUEST_STATUS.PENDING,
        };
      },
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          registerState: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          error: payload,
          registerState: REQUEST_STATUS.FAIL,
        };
      },
      initialValue: initialState,
    }),

    ...requestLoopHandlers({
      action: LOGIN,
      onSuccess: (state, payload) => {
        const { token } = payload;
        setToken(token);
        setAuthToken(token);
        const decoded = jwt_decode(token);
        return {
          ...state,
          isLoggedIn: true,
          token: payload.token,
          user: decoded,
          error: {},
          loginState: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          isLoggedIn: false,
          error: payload,
          loginState: REQUEST_STATUS.FAIL,
        };
      },
      stateField: 'loginState',
    }),

    ...requestLoopHandlers({
      action: ACCEPTNEWPRICE,
      onSuccess: (state, payload) => {
        const { token } = payload;
        setToken(token);
        setAuthToken(token);
        const decoded = jwt_decode(token);
        return {
          ...state,
          isLoggedIn: true,
          token: payload.token,
          user: decoded,
          error: {},
          loginState: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          isLoggedIn: false,
          error: payload,
          loginState: REQUEST_STATUS.FAIL,
        };
      },
      stateField: 'loginState',
    }),

    ...requestLoopHandlers({
      action: RESTPASSWORD,
      onStart: (state, payload) => {
        return {
          ...state,
          resetPasswordState: REQUEST_STATUS.PENDING,
        };
      },
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          resetPasswordState: REQUEST_STATUS.SUCCESS,
        };
      },
      initialValue: initialState,
    }),

    ...requestLoopHandlers({
      action: RESTPASSWORDEMAIL,
      onStart: (state, payload) => {
        return {
          ...state,
          resetPasswordState: REQUEST_STATUS.PENDING,
        };
      },
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          email: payload,
          resetPasswordState: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          error: payload,
          resetPasswordState: REQUEST_STATUS.FAIL,
        };
      },
      initialValue: initialState,
    }),

    [LOGOUT]: state => {
      removeToken();
      setAuthToken(false);
      return {
        token: '',
        user: {},
      };
    },
  },
  initialState
);
