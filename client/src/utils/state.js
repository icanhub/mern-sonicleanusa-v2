import { createAction } from 'redux-actions';
import { REQUEST_STATUS } from '../_config/constants';
 
export const requestSuccess = actionType => `${actionType}/success`;

export const requestFail = actionType => `${actionType}/fail`;

export const requestResetState = actionType => `${actionType}/reset`;

export const requestEnd = actionType => `${actionType}/end`;

export function isPending(requestState) {
  return requestState === REQUEST_STATUS.PENDING;
}

export function hasSucceeded(requestState) {
  return requestState === REQUEST_STATUS.SUCCESS;
}

export function hasFailed(requestState) {
  return requestState === REQUEST_STATUS.FAIL;
}

export function isInitial(requestState) {
  return requestState === REQUEST_STATUS.INITIAL;
}

export const defineLoopActions = actionType => ({
  start: createAction(actionType),
  success: createAction(requestSuccess(actionType)),
  fail: createAction(requestFail(actionType)),
  end: createAction(requestEnd(actionType)),
  reset: createAction(requestResetState(actionType)),
});

export function requestLoopHandlers(config) {
  /*
   * This function will be used for registering async request loop handlers for update request
   * such as GET, POST, PUT and DELETE RESTful API calls.
   * It'll handle initial, success and fail cases.
   * `action` and `stateField` are required as config values.
   */
  let { action, onStart, onSuccess, onFail, onEnd, stateField } = config;

  if (!action) {
    throw new Error(
      'action and stateField should be set for generating update request loop handlers'
    );
  }

  return {
    [action]: (state, { payload }) => {
      if (onStart) {
        return onStart(state, payload);
      } else {
        if (!stateField) {
          return { ...state, state: REQUEST_STATUS.PENDING };
        } else {
          state[stateField] = REQUEST_STATUS.PENDING;
          return { ...state };
        }
      }
    },
    [requestSuccess(action)]: (state, { payload }) => {
      if (onSuccess) {
        return onSuccess(state, payload);
      } else {
        if (!stateField) {
          return { ...state, state: REQUEST_STATUS.SUCCESS };
        } else {
          state[stateField] = REQUEST_STATUS.SUCCESS;
          return { ...state };
        }
      }
    },
    [requestFail(action)]: (state, { payload }) => {
      if (onFail) {
        return onFail(state, payload);
      } else {
        if (!stateField) {
          state['state'] = REQUEST_STATUS.FAIL;
        } else {
          state[stateField] = REQUEST_STATUS.FAIL;
        }
        return {
          ...state,
          //   error: { code: payload.status_code, message: payload.status_message },
        };
      }
    },
    [requestResetState(action)]: (state, { payload }) => {
      if (onEnd) {
        return onEnd(state, payload);
      } else {
        if (!stateField) {
          state['state'] = REQUEST_STATUS.INITIAL;
        } else {
          state[stateField] = REQUEST_STATUS.INITIAL;
        }
        return { ...state };
      }
    },
  };
}
