import { handleActions } from 'redux-actions';
import {
  GETSONICLEANUSERS,
  ADDNEWSONICLEANUSER,
  DELETESONICLEANUSER,
  PDFFILEUPLOAD,
  GETMANAGERUPLODFILE,
  KARASTANLISTUPLOADFILE,
  GETKARASTANLIST,
} from './constants';
import { getToken } from '../../_helpers/token-helpers';

import { REQUEST_STATUS } from '../../_config/constants';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';

const initialState = {
  sonicleanusers: [],
  pdf_file: '',
  karastan_file: [],
  error: {},
  state: REQUEST_STATUS.INITIAL,
};

/* Action creators */
export const {
  start: getSonicleanUserList,
  success: getSonicleanUserListSuccess,
  fail: getSonicleanUserListFail,
} = defineLoopActions(GETSONICLEANUSERS);

export const {
  start: addNewSonicleanUser,
  success: addNewSonicleanUserSuccess,
  fail: addNewSonicleanUserFail,
} = defineLoopActions(ADDNEWSONICLEANUSER);

export const {
  start: deleteSonicleanUser,
  success: deleteSonicleanUserSuccess,
  fail: deleteSonicleanUserFail,
} = defineLoopActions(DELETESONICLEANUSER);

export const {
  start: pdfFileUpload,
  success: pdfFileUploadSuccess,
  fail: pdfFileUploadFail,
} = defineLoopActions(PDFFILEUPLOAD);

export const {
  start: karastanlistFileUpload,
  success: karastanlistFileUploadSuccess,
  fail: karastanlistFileUploadFail,
} = defineLoopActions(KARASTANLISTUPLOADFILE);

export const {
  start: getKarastanList,
  success: getKarastanListSuccess,
  fail: getKarastanListFail,
} = defineLoopActions(GETKARASTANLIST);

export const {
  start: getManagerUploadFile,
  success: getManagerUploadFileSuccess,
  fail: getManagerUploadFileFail,
} = defineLoopActions(GETMANAGERUPLODFILE);

export const fetchSonicleanUsersList = () => {
  const apiUrl = `/api/manager/users`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getSonicleanUserList,
    onSuccess: getSonicleanUserListSuccess,
    onFailure: getSonicleanUserListFail,
    label: GETSONICLEANUSERS,
  });
};

export const addSonicleanUser = data => {
  const apiUrl = `/api/manager/new`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    data: data,
    onStart: addNewSonicleanUser,
    onSuccess: addNewSonicleanUserSuccess,
    onFailure: addNewSonicleanUserFail,
    label: ADDNEWSONICLEANUSER,
  });
};

export const delSonicleanUser = id => {
  const apiUrl = `/api/manager/delete/${id}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteSonicleanUser,
    onSuccess: deleteSonicleanUserSuccess,
    onFailure: deleteSonicleanUserFail,
    label: DELETESONICLEANUSER,
  });
};

export const pdfFileUPload = data => {
  const apiUrl = `/api/managerfileupload/fileupload`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    onStart: pdfFileUpload,
    onSuccess: pdfFileUploadSuccess,
    onFailure: pdfFileUploadFail,
    data: data,
    label: PDFFILEUPLOAD,
  });
};

export const karastanFileUpload = data => {
  const apiUrl = `/api/mohawkexcelupload/fileupload`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    onStart: karastanlistFileUpload,
    onSuccess: karastanlistFileUploadSuccess,
    onFailure: karastanlistFileUploadFail,
    data: data,
    label: KARASTANLISTUPLOADFILE,
  });
};

export const fetchKarastanList = () => {
  const apiUrl = `/api/manager/karastan`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'GET',
    accessToken: token,
    onStart: getKarastanList,
    onSuccess: getKarastanListSuccess,
    onFailure: getKarastanListFail,
    label: GETKARASTANLIST,
  });
};

export const fetchManagerUploadFile = () => {
  const apiUrl = `/api/manager/uploadfile`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getManagerUploadFile,
    onSuccess: getManagerUploadFileSuccess,
    onFailure: getManagerUploadFileFail,
    label: GETMANAGERUPLODFILE,
  });
};

export const managerReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: GETSONICLEANUSERS,
      onSuccess: (state, payload) => {
        return {
          ...state,
          sonicleanusers: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
    ...requestLoopHandlers({
      action: ADDNEWSONICLEANUSER,
      onSuccess: (state, payload) => {
        return {
          ...state,
          sonicleanusers: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
    ...requestLoopHandlers({
      action: DELETESONICLEANUSER,
      onSuccess: (state, payload) => {
        return {
          ...state,
          sonicleanusers: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
    ...requestLoopHandlers({
      action: PDFFILEUPLOAD,
      onSuccess: (state, payload) => {
        return {
          ...state,
          pdf_file: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: KARASTANLISTUPLOADFILE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          karastan_file: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: GETKARASTANLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          karastan: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: GETMANAGERUPLODFILE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          pdf_file: payload,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
  },
  initialState
);
