import { createAction, handleActions } from 'redux-actions';
import { REQUEST_STATUS } from '../../_config/constants';
import { apiAction } from '../../utils/apiCall';
import { getToken } from '../../_helpers/token-helpers';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';
import {
  SALESFORM_ORDERTYPE,
  SELECT_INVENTORY,
  SELECT_SHIP,
  SELECT_SHIPPINGINFO,
  SELECTED_SHIPPINGINFO,
  SELECTED_INVENTORYDATA,
  DISCOUNT,
  SELECTEDPAYMENT,
  SELECTSTORELOCATION,
  SELECTCARD,
  SELECTUSERS,
  SETEMPLOYEEFIRSTNAME,
  SETEMPLOYEELASTNAME,
  SUBMITORDER,
  SETCUSTOMERINFO,
  RESTORDER,
  SETDISCOUNT,
  CLEAR_SELECTED_PRODUCTS,
  VACUUM_QUANTITY,
  VACUUM_TOTAL,
} from './constants';

const initialState = {
  orderType: -1,
  vacuumQuantity: 0,
  vacuumTotal: 0,
  inventory: [],
  inventoryData: [],
  ship: [],
  shippinginfor: -1,
  customerinfo: {},
  customerInformation: {},
  discontValue: {},
  selectedStore: '',
  selectedCard: '',
  selectedUsers: [],
  employeeFirstName: '',
  employeeLastName: '',
  paymentId: '',
  orderResponseData: {},
  submitSuccess: false,
  discount: 0,
  state: REQUEST_STATUS.INITIAL,
};

/* Action creators */

export const selectOrderType = createAction(SALESFORM_ORDERTYPE);
export const selectInventory = createAction(SELECT_INVENTORY);
export const selectVacuumQuantity = createAction(VACUUM_QUANTITY);
export const selectVacuumTotal = createAction(VACUUM_TOTAL);
export const clearSelectedProdcuts = createAction(CLEAR_SELECTED_PRODUCTS);
export const selectShip = createAction(SELECT_SHIP);
export const selectShippingInfor = createAction(SELECT_SHIPPINGINFO);
export const selectedShippingInfor = createAction(SELECTED_SHIPPINGINFO);
export const selectedInventoryData = createAction(SELECTED_INVENTORYDATA);
export const discount = createAction(DISCOUNT);
export const selectedPayment = createAction(SELECTEDPAYMENT);
export const onSelectStoreLocation = createAction(SELECTSTORELOCATION);
export const onSelectCard = createAction(SELECTCARD);
export const onSelectUsers = createAction(SELECTUSERS);
export const onSetEmployeeFirstName = createAction(SETEMPLOYEEFIRSTNAME);
export const onSetEmployeeLastName = createAction(SETEMPLOYEELASTNAME);
export const onSetCustomerInfo = createAction(SETCUSTOMERINFO);
export const onSetDiscount = createAction(SETDISCOUNT);

export const {
  start: submitOrder,
  success: submitOrderSuccess,
  fail: submitOrderFail,
} = defineLoopActions(SUBMITORDER);

export const onSubmitOrder = (data, dealer_id) => {
  const apiUrl = `/shipstation-api/salesform/order/${dealer_id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    onStart: submitOrder,
    onSuccess: submitOrderSuccess,
    onFailure: submitOrderFail,
    data: data,
    label: SUBMITORDER,
  });
};

export const submitOrderReset = createAction(RESTORDER);

export const SalesFormReducer = handleActions(
  {
    [SALESFORM_ORDERTYPE]: (state, { payload }) => {
      return {
        ...state,
        orderType: payload,
      };
    },
    [VACUUM_QUANTITY]: (state, { payload }) => {
      return {
        ...state,
        vacuumQuantity: payload,
      };
    },
    [VACUUM_TOTAL]: (state, { payload }) => {
      return {
        ...state,
        vacuumTotal: payload,
      };
    },

    [SELECT_INVENTORY]: (state, { payload }) => {
      return {
        ...state,
        inventory: payload,
      };
    },
    [SELECT_SHIP]: (state, { payload }) => {
      return {
        ...state,
        ship: payload,
      };
    },
    [CLEAR_SELECTED_PRODUCTS]: (state, { payload }) => {
      return {
        ...state,
        ship: [],
        inventory: [],
        state: REQUEST_STATUS.INITIAL,
      };
    },
    [SELECT_SHIPPINGINFO]: (state, { payload }) => {
      return {
        ...state,
        shippinginfor: payload,
      };
    },
    [SELECTED_SHIPPINGINFO]: (state, { payload }) => {
      return {
        ...state,
        customerinfo: payload,
      };
    },
    [SELECTED_INVENTORYDATA]: (state, { payload }) => {
      return {
        ...state,
        inventoryData: payload,
      };
    },
    [DISCOUNT]: (state, { payload }) => {
      return {
        ...state,
        discontValue: payload,
      };
    },
    [SELECTEDPAYMENT]: (state, { payload }) => {
      return {
        ...state,
        paymentId: payload,
      };
    },
    [SELECTSTORELOCATION]: (state, { payload }) => {
      return {
        ...state,
        selectedStore: payload,
      };
    },
    [SELECTCARD]: (state, { payload }) => {
      return {
        ...state,
        selectedCard: payload,
      };
    },
    [SELECTUSERS]: (state, { payload }) => {
      return {
        ...state,
        selectedUsers: payload,
      };
    },
    [SETEMPLOYEEFIRSTNAME]: (state, { payload }) => {
      return {
        ...state,
        employeeFirstName: payload,
      };
    },

    [SETEMPLOYEELASTNAME]: (state, { payload }) => {
      return {
        ...state,
        employeeLastName: payload,
      };
    },

    [SETCUSTOMERINFO]: (state, { payload }) => {
      return {
        ...state,
        customerInformation: payload,
      };
    },
    [SETDISCOUNT]: (state, { payload }) => {
      return {
        ...state,
        discount: payload,
      };
    },
    [RESTORDER]: (state, { payload }) => {
      return {
        ...initialState,
        ship: [],
        inventory: [],
        shippinginfor: -1,
        customerinfo: {},
        customerInformation: {},
        discontValue: {},
        selectedStore: '',
        selectedCard: '',
        selectedUsers: [],
        state: REQUEST_STATUS.INITIAL,
      };
    },

    ...requestLoopHandlers({
      action: SUBMITORDER,
      onSuccess: (state, payload) => {
        return {
          ...state,
          submitSuccess: true,
          error: {},
          orderResponseData: payload,
          state: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        return {
          ...state,
          error: payload,
          submitSuccess: false,
          state: REQUEST_STATUS.FAIL,
        };
      },
    }),
  },
  initialState
);
