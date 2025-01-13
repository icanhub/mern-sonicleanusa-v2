import { handleActions, createAction } from 'redux-actions';
import { SHOWNOTIFICATION, REMOVENOTIFICATION } from './constants';

import { REQUEST_STATUS } from '../../_config/constants';

const initialState = {
  message: '',
  notificationState: REQUEST_STATUS.INITIAL,
};

/* Action creators */

export const showNotification = createAction(SHOWNOTIFICATION);
export const removeNotification = createAction(REMOVENOTIFICATION);

export const NotificationReducer = handleActions(
  {
    [SHOWNOTIFICATION]: (state, payload) => {
      return {
        ...state,
        notificationState: payload.state,
        message: payload.message,
      };
    },
    [REMOVENOTIFICATION]: state => {
      return {
        ...state,
        message: '',
        notificationState: REQUEST_STATUS.INITIAL,
      };
    },
  },
  initialState
);
