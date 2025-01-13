import { handleActions } from 'redux-actions';
import {
  GETUSERSLIST,
  ADD_USER,
  DELETE_USER,
  ADD_NOTES,
  GETNOTESLIST,
  DELETE_NOTE,
  UPDATENOTE,
} from './constants';
import { REQUEST_STATUS } from '../../_config/constants';
import { getToken } from '../../_helpers/token-helpers';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';
const initialState = {
  usersData: [],
  isSubmitSuccess: false,
  fetching_state: REQUEST_STATUS.INITIAL,
  posting_state: REQUEST_STATUS.INITIAL,
  deleting_state: REQUEST_STATUS.INITIAL,
  error: {},
};

/* Action creators */
export const {
  start: addUser,
  success: addUserSuccess,
  fail: addUserFail,
  reset: resetAddUserState,
} = defineLoopActions(ADD_USER);

export const {
  start: getUsers,
  success: getUsersSuccess,
  fail: getUsersFail,
} = defineLoopActions(GETUSERSLIST);

export const {
  start: deleteUser,
  success: deleteUserSuccess,
  fail: deleteUserFail,
} = defineLoopActions(DELETE_USER);

export const {
  start: addNotes,
  success: addNotesSuccess,
  fail: addNotesFail,
  reset: resetAddNotesState,
} = defineLoopActions(ADD_NOTES);

export const {
  start: getNotes,
  success: getNotesSuccess,
  fail: getNotesFail,
} = defineLoopActions(GETNOTESLIST);

export const {
  start: updateNote,
  success: updateNoteSuccess,
  fail: updateNoteFail,
} = defineLoopActions(UPDATENOTE);

export const {
  start: deleteNote,
  success: deleteNoteSuccess,
  fail: deleteNoteFail,
} = defineLoopActions(DELETE_NOTE);

/* Actions  */

export const fetchUsers = id => {
  const apiUrl = `/api/employee/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getUsers,
    onSuccess: getUsersSuccess,
    onFailure: getUsersFail,
    label: GETUSERSLIST,
  });
};

export const saveUser = (data, id) => {
  const apiUrl = `/api/employee/new/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    data: data,
    onStart: addUser,
    onSuccess: addUserSuccess,
    onFailure: addUserFail,
    label: ADD_USER,
  });
};

export const deleteUserRequest = (id, dealer) => {
  const apiUrl = `/api/employee/delete/${id}/${dealer}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteUser,
    onSuccess: deleteUserSuccess,
    onFailure: deleteUserFail,
    label: DELETE_USER,
  });
};

export const saveNotes = (data, id) => {
  const apiUrl = `/api/employee/notes/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    data: data,
    onStart: addNotes,
    onSuccess: addNotesSuccess,
    onFailure: addNotesFail,
    label: ADD_NOTES,
  });
};

export const fetchNotes = id => {
  const apiUrl = `/api/employee/getnotes/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    accessToken: token,
    onStart: getNotes,
    onSuccess: getNotesSuccess,
    onFailure: getNotesFail,
    label: GETNOTESLIST,
  });
};

export const putNote = (data, id, dealer) => {
  const apiUrl = `/api/employee/updatenote/${id}/${dealer}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    data: data,
    onStart: updateNote,
    onSuccess: updateNoteSuccess,
    onFailure: updateNoteFail,
    label: UPDATENOTE,
  });
};

export const deleteNoteRequest = (id, dealer) => {
  const apiUrl = `/api/employee/deletenote/${id}/${dealer}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteNote,
    onSuccess: deleteNoteSuccess,
    onFailure: deleteNoteFail,
    label: DELETE_NOTE,
  });
};

/* Reducers  */
export const UserReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: ADD_USER,
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          usersData: payload,
          posting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'posting_state',
    }),

    ...requestLoopHandlers({
      action: GETUSERSLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          usersData: payload,
          error: {},
          fetching_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'fetching_state',
    }),

    ...requestLoopHandlers({
      action: DELETE_USER,
      onStart: (state, payload) => ({
        ...state,
        deleting_state: REQUEST_STATUS.PENDING,
        error: {},
      }),
      onSuccess: (state, payload) => {
        return {
          ...state,
          usersData: payload,
          deleting_state: REQUEST_STATUS.SUCCESS,
          error: {},
        };
      },
      stateField: 'deleting_state',
    }),

    ...requestLoopHandlers({
      action: ADD_NOTES,
      onSuccess: (state, payload) => {
        return {
          ...state,
          error: {},
          notesData: payload,
          posting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'posting_state',
    }),

    ...requestLoopHandlers({
      action: GETNOTESLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          notesList: payload,
          error: {},
          fetching_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'fetching_state',
    }),

    ...requestLoopHandlers({
      action: UPDATENOTE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          updatedNoteData: payload,
          posting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'posting_state',
    }),

    ...requestLoopHandlers({
      action: DELETE_NOTE,
      onStart: (state, payload) => ({
        ...state,
        deleting_state: REQUEST_STATUS.PENDING,
        error: {},
      }),
      onSuccess: (state, payload) => {
        return {
          ...state,
          deleteNoteData: payload,
          deleting_state: REQUEST_STATUS.SUCCESS,
          error: {},
        };
      },
      stateField: 'deleting_state',
    }),
  },
  initialState
);
