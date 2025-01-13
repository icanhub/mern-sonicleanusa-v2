import { handleActions } from "redux-actions";
import {
  GETDEALERSLIST,
  DELETEDEALER,
  DEALERACTIVATION,
  GETNEWDEALERLIST,
  NEWDEALERLISTUPLOAD,
  SENTONETIMEACTIVEEMIL,
  SENDINVITEEMAIL,
} from "./constants";
import { getToken } from "../../_helpers/token-helpers";

import { REQUEST_STATUS } from "../../_config/constants";
import { apiAction } from "../../utils/apiCall";
import { defineLoopActions, requestLoopHandlers } from "../../utils/state";

const initialState = {
  dealersList: [],
  newDealerList: [],
  totalCount: 0,
  currentPage: 1,
  sizePerPage: 5,
  error: {},
  activationToken: false,
  message: "",
  dealerlistfile: "",
  state: REQUEST_STATUS.INITIAL,
  onetimeemail_state: REQUEST_STATUS.INITIAL,
};

/* Action creators */
export const {
  start: getDealersList,
  success: getDealersListSuccess,
  fail: getDealersListFail,
} = defineLoopActions(GETDEALERSLIST);

export const {
  start: getNewDealersList,
  success: getNewDealersListSuccess,
  fail: getNewDealersListFail,
} = defineLoopActions(GETNEWDEALERLIST);

export const {
  start: deleteDealer,
  success: deleteDealerSuccess,
  fail: deleteDealerFail,
} = defineLoopActions(DELETEDEALER);

export const {
  start: dealerActivation,
  success: dealerActivationSuccess,
  fail: dealerActivationFail,
  reset: activateResetState,
} = defineLoopActions(DEALERACTIVATION);

export const {
  start: newDealrlistFileUpload,
  success: newDealrlistFileUploadSuccess,
  fail: newDealrlistFileUploadFail,
} = defineLoopActions(NEWDEALERLISTUPLOAD);

export const {
  start: sendOnetimeActivationEmail,
  success: sendOnetimeActivationEmailSuccess,
  fail: sendOnetimeActivationEmailFail,
} = defineLoopActions(SENTONETIMEACTIVEEMIL);

export const {
  start: sendInviteEmail,
  success: sendInviteEmailSuccess,
  fail: sendInviteEmailFail,
} = defineLoopActions(SENDINVITEEMAIL);

export const fetchDealersList = (data) => {
  const apiUrl = `/api/official/dealers?isVerified=${data.isVerified}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getDealersList,
    onSuccess: getDealersListSuccess,
    onFailure: getDealersListFail,
    label: GETDEALERSLIST,
  });
};

export const fetchNewDealersList = (data) => {
  const apiUrl = `/api/official/dealers?isVerified=${data.isVerified}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getNewDealersList,
    onSuccess: getNewDealersListSuccess,
    onFailure: getNewDealersListFail,
    label: GETNEWDEALERLIST,
  });
};

export const deleteDealerById = (id, isVerified) => {
  const apiUrl = `/api/official/delete/${id}/${isVerified}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: "DELETE",
    accessToken: token,
    onStart: deleteDealer,
    onSuccess: deleteDealerSuccess,
    onFailure: deleteDealerFail,
    label: DELETEDEALER,
  });
};

export const dealerActivationRequest = (storeId, dealerId, data) => {
  const apiUrl = `/api/official/activate/${storeId}/${dealerId}`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: "PUT",
    accessToken: token,
    data: data,
    onStart: dealerActivation,
    onSuccess: dealerActivationSuccess,
    onFailure: dealerActivationFail,
    label: DEALERACTIVATION,
  });
};

export const newDealerFileUpload = (data) => {
  const apiUrl = `/api/newdealerfileupload/fileupload`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: "POST",
    accessToken: token,
    onStart: newDealrlistFileUpload,
    onSuccess: newDealrlistFileUploadSuccess,
    onFailure: newDealrlistFileUploadFail,
    data: data,
    label: NEWDEALERLISTUPLOAD,
  });
};

export const sendOnetimeActivationEmailApi = () => {
  const apiUrl = `/api/official/sendonetimeactivationemail`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: "PUT",
    accessToken: token,
    onStart: sendOnetimeActivationEmail,
    onSuccess: sendOnetimeActivationEmailSuccess,
    onFailure: sendOnetimeActivationEmailFail,
    label: NEWDEALERLISTUPLOAD,
  });
};

export const sendInviteEmailApi = (data) => {
  const apiUrl = `/api/users/add-new-dealer`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: "POST",
    accessToken: token,
    onStart: sendInviteEmail,
    onSuccess: sendInviteEmailSuccess,
    onFailure: sendInviteEmailFail,
    data: data,
    label: SENDINVITEEMAIL,
  });
};

export const officialReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: GETDEALERSLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          message: payload.message,
          dealersList: payload.data,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: GETNEWDEALERLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          message: payload.message,
          newDealerList: payload.data,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: DELETEDEALER,
      onSuccess: (state, payload) => {
        if (payload.type === "true") {
          return {
            ...state,
            message: payload.message,
            dealersList: payload.data,
            state: REQUEST_STATUS.SUCCESS,
          };
        } else {
          return {
            ...state,
            message: payload.message,
            dealersList: payload.data,
            newDealerList: payload.data,
            state: REQUEST_STATUS.SUCCESS,
          };
        }
      },
    }),

    ...requestLoopHandlers({
      action: DEALERACTIVATION,
      onSuccess: (state, payload) => {
        return {
          ...state,
          message: payload.message,
          dealersList: payload.data,
          activationToken: payload !== "" ? true : false,
          state: REQUEST_STATUS.SUCCESS,
        };
      },

      ...requestLoopHandlers({
        action: NEWDEALERLISTUPLOAD,
        onSuccess: (state, payload) => {
          return {
            ...state,
            dealerlistfile: payload,
            error: {},
            state: REQUEST_STATUS.SUCCESS,
          };
        },
      }),

      ...requestLoopHandlers({
        action: SENTONETIMEACTIVEEMIL,
        onSuccess: (state, payload) => {
          return {
            ...state,
            error: {},
            onetimeemail_state: REQUEST_STATUS.SUCCESS,
          };
        },
        stateField: "onetimeemail_state",
      }),
    }),

    ...requestLoopHandlers({
      action: SENDINVITEEMAIL,
      onSuccess: (state, payload) => {
        return {
          ...state,
          message: payload.message,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          message: payload.message,
          error: {},
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),
  },
  initialState
);
