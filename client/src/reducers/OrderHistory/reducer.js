import { handleActions, createAction } from 'redux-actions';
import {
  GETORDERLIST,
  GETORDERBYID,
  UPLOADMHKINVOICEFILE,
  GETSOCKETORDERLIST,
  SHIPPINGMKTORDER,
  ORDERLISTUPLOADFILE,
  DELETEORDER,
  EDITORDER,
  UPLOADORDERDATABYID,
  GETSHAREDORDERINFO,
  UPDATESHAREDORDERINFO,
  REJECTEDORDERINFO,
  REINSTATEORDERINFO,
  RELEASEORDERINFO,
  GETLIVEDEALERS,
  UPDATEMOHAWKINVOICEDATE,
  UPDATEDEALERLOCATION,
  DELETEDEALERLOCATION,
  ADDDEALERLOCATION,
  MHKPOFILEUPDATE,
  ADD_NOTES,
  GETNOTESLIST,
  DELETE_NOTE,
  UPDATENOTE,
} from './constants';
import { getToken } from '../../_helpers/token-helpers';
import { REQUEST_STATUS } from '../../_config/constants';
import { notification } from '../../utils/notification';
import { apiAction } from '../../utils/apiCall';
import { defineLoopActions, requestLoopHandlers } from '../../utils/state';

const initialState = {
  orderhistorylist: [],
  orderDataById: {},
  orderStatus: '',
  orderMohawk: '',
  orderlist_file: [],
  orderDiscount: 0,
  shipping_mkt_order: {},
  trackingNumbers: [],
  sharedOrderInfo: {},
  livedealers: [],
  getting_orderlist_state: REQUEST_STATUS.INITIAL,
  getting_orderbyid_state: REQUEST_STATUS.INITIAL,
  fixing_state: REQUEST_STATUS.INITIAL,
  deleting_state: REQUEST_STATUS.INITIAL,
  editing_state: REQUEST_STATUS.INITIAL,
  uploading_state: REQUEST_STATUS.INITIAL,
  state: REQUEST_STATUS.INITIAL,
  get_sharedorder_state: REQUEST_STATUS.INITIAL,
  update_sharedorder_state: REQUEST_STATUS.INITIAL,
  reject_sharedorder_state: REQUEST_STATUS.INITIAL,
  reinstate_order_state: REQUEST_STATUS.INITIAL,
  release_order_state: REQUEST_STATUS.INITIAL,
  getting_livedealers_state: REQUEST_STATUS.INITIAL,
  uploading_mhkinvoice_state: REQUEST_STATUS.INITIAL,
  update_mohawkinvoicedate_state: REQUEST_STATUS.INITIAL,
  updating_dealer_location: REQUEST_STATUS.INITIAL,
  deleting_dealer_location: REQUEST_STATUS.INITIAL,
  adding_dealer_location: REQUEST_STATUS.INITIAL,
  updating_pofile_state: REQUEST_STATUS.INITIAL,
};

export const {
  start: getOrder,
  success: getOrderSuccess,
  fail: getOrderFail,
} = defineLoopActions(GETORDERLIST);

export const {
  start: uploadMHKInvoiceFile,
  success: uploadMHKInvoiceFileSuccess,
  fail: uploadMHKInvoiceFileFail,
} = defineLoopActions(UPLOADMHKINVOICEFILE);

export const {
  start: getOrderById,
  success: getOrderByIdSuccess,
  fail: getOrderByIdFail,
} = defineLoopActions(GETORDERBYID);

export const {
  start: shippingMKTOrder,
  success: shippingMKTOrderSuccess,
  fail: shippingMKTOrderFail,
} = defineLoopActions(SHIPPINGMKTORDER);

export const {
  start: orderListFileUpload,
  success: orderListFileUploadSuccess,
  fail: orderListFileUploadFail,
} = defineLoopActions(ORDERLISTUPLOADFILE);

export const {
  start: deleteOrderById,
  success: deleteOrderByIdSuccess,
  fail: deleteOrderByIdFail,
  reset: deleteOrderByIdReset,
} = defineLoopActions(DELETEORDER);

export const {
  start: editOrderById,
  success: editOrderByIdSuccess,
  fail: editOrderByIdFail,
  reset: editOrderByIdReset,
} = defineLoopActions(EDITORDER);

export const {
  start: uploadOrderDataById,
  success: uploadOrderDataByIdSuccess,
  fail: uploadOrderDataByIdFail,
  reset: uploadOrderDataByIdReset,
} = defineLoopActions(UPLOADORDERDATABYID);

export const {
  start: getSharedOrderInfo,
  success: getSharedOrderInfoSuccess,
  fail: getSharedOrderInfoFail,
} = defineLoopActions(GETSHAREDORDERINFO);

export const {
  start: updateSahredOrderInfo,
  success: updateSahredOrderInfoSuccess,
  fail: updateSahredOrderInfoFail,
} = defineLoopActions(UPDATESHAREDORDERINFO);

export const {
  start: rejectedOrderInfo,
  success: rejectedOrderInfoSuccess,
  fail: rejectedOrderInfoFail,
} = defineLoopActions(REJECTEDORDERINFO);

export const {
  start: reinstateOrderInfo,
  success: reinstateOrderInfoSuccess,
  fail: reinstateOrderInfoFail,
} = defineLoopActions(REINSTATEORDERINFO);

export const {
  start: releaseOrderInfo,
  success: releaseOrderInfoSuccess,
  fail: releaseOrderInfoFail,
} = defineLoopActions(RELEASEORDERINFO);

export const {
  start: getLiveDealers,
  success: getLiveDealersSuccess,
  fail: getLiveDealersFail,
} = defineLoopActions(GETLIVEDEALERS);

export const {
  start: updateMohawkInvoiceDate,
  success: updateMohawkInvoiceDateSuccess,
  fail: updateMohawkInvoiceDateFail,
} = defineLoopActions(UPDATEMOHAWKINVOICEDATE);

export const {
  start: updateDealerLocation,
  success: updateDealerLocationSuccess,
  fail: updateDealerLocationFail,
  reset: updateDealerLocationReset,
} = defineLoopActions(UPDATEDEALERLOCATION);

export const {
  start: deleteDealerLocation,
  success: deleteDealerLocationSuccess,
  fail: deleteDealerLocationFail,
} = defineLoopActions(DELETEDEALERLOCATION);

export const {
  start: addDealerLocation,
  success: addDealerLocationSuccess,
  fail: addDealerLocationFail,
} = defineLoopActions(ADDDEALERLOCATION);

export const {
  start: mhkpofileupdate,
  success: mhkpofileupdateSuccess,
  fail: mhkpofileupdateFail,
} = defineLoopActions(MHKPOFILEUPDATE);

// Order-Notes

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

export const fetchOrderHistoryList = id => {
  let apiUrl = `/shipstation-api/orders/orderslist?`;

  if (id) {
    apiUrl = `${apiUrl}id=${id}`;
  }
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'GET',
    accessToken: token,
    onStart: getOrder,
    onSuccess: getOrderSuccess,
    onFailure: getOrderFail,
    label: GETORDERLIST,
  });
};

export const fetchOrderByID = id => {
  const apiUrl = `/shipstation-api/orders/order/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'GET',
    accessToken: token,
    onStart: getOrderById,
    onSuccess: getOrderByIdSuccess,
    onFailure: getOrderByIdFail,
    label: GETORDERBYID,
  });
};

export const uploadMHKInvoicFileApi = data => {
  const apiUrl = `/shipstation-api/mhkinvoicefileupload/fileupload`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: uploadMHKInvoiceFile,
    onSuccess: uploadMHKInvoiceFileSuccess,
    onFailure: uploadMHKInvoiceFileFail,
    data: data,
    label: UPLOADMHKINVOICEFILE,
  });
};

export const updatePOFileApi = data => {
  const apiUrl = `/shipstation-api/mhkpoupdate/fileupload`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: mhkpofileupdate,
    onSuccess: mhkpofileupdateSuccess,
    onFailure: mhkpofileupdateFail,
    data: data,
    label: MHKPOFILEUPDATE,
  });
};

export const fetchShippingMKTOrder = (id, tracking_number) => {
  const apiUrl = `/shipstation-api/orders/shippingmktorder/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: shippingMKTOrder,
    onSuccess: shippingMKTOrderSuccess,
    onFailure: shippingMKTOrderFail,
    data: { mkt_trackingnumber: tracking_number },
    label: SHIPPINGMKTORDER,
  });
};

export const uploadOrderListFile = data => {
  const apiUrl = `/shipstation-api/ordersupload/orders-upload`;
  const token = getToken();
  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    onStart: orderListFileUpload,
    onSuccess: orderListFileUploadSuccess,
    onFailure: orderListFileUploadFail,
    data: data,
    label: ORDERLISTUPLOADFILE,
  });
};

export const deleteOrderApi = id => {
  const apiUrl = `/shipstation-api/orders/order/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteOrderById,
    onSuccess: deleteOrderByIdSuccess,
    onFailure: deleteOrderByIdFail,
    label: DELETEORDER,
  });
};

export const editOrderApi = (id, data) => {
  const apiUrl = `/shipstation-api/order_edit/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: editOrderById,
    onSuccess: editOrderByIdSuccess,
    onFailure: editOrderByIdFail,
    data: data,
    label: EDITORDER,
  });
};

export const uploadOrderDataApi = (id, data) => {
  const apiUrl = `/shipstation-api/orders/${id}/fileupload`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: editOrderById,
    onSuccess: editOrderByIdSuccess,
    onFailure: editOrderByIdFail,
    data: data,
    label: UPLOADORDERDATABYID,
  });
};

export const fetchSharedOrderInfo = orderToken => {
  const apiUrl = `/shipstation-api/orders/share/${orderToken}`;

  return apiAction({
    url: apiUrl,
    method: 'GET',
    onStart: getSharedOrderInfo,
    onSuccess: getSharedOrderInfoSuccess,
    onFailure: getSharedOrderInfoFail,
    label: GETSHAREDORDERINFO,
  });
};

export const rejectSharedOrderInfo = (orderToken, data) => {
  const apiUrl = `/shipstation-api/orders/share/${orderToken}`;

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    onStart: rejectedOrderInfo,
    onSuccess: rejectedOrderInfoSuccess,
    onFailure: rejectedOrderInfoFail,
    data: data,
    label: REJECTEDORDERINFO,
  });
};

export const approveSharedOrderInfo = (orderToken, data) => {
  const apiUrl = `/shipstation-api/poinfofileupload/share/${orderToken}`;
  return apiAction({
    url: apiUrl,
    method: 'POST',
    data: data,
    onStart: updateSahredOrderInfo,
    onSuccess: updateSahredOrderInfoSuccess,
    onFailure: updateSahredOrderInfoFail,
    label: UPDATESHAREDORDERINFO,
  });
};

export const reinstateOrderInfoApi = id => {
  const apiUrl = `/shipstation-api/orders/reinstate/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: reinstateOrderInfo,
    onSuccess: reinstateOrderInfoSuccess,
    onFailure: reinstateOrderInfoFail,
    label: REINSTATEORDERINFO,
  });
};

export const releaseOrderInfoApi = (orderinfo, id) => {
  const apiUrl = `/shipstation-api/salesform/mohawkorder/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: releaseOrderInfo,
    onSuccess: releaseOrderInfoSuccess,
    onFailure: releaseOrderInfoFail,
    data: orderinfo,
    label: RELEASEORDERINFO,
  });
};

export const getLiveDealersApi = () => {
  const apiUrl = `/shipstation-api/orders/livedealers`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'GET',
    accessToken: token,
    onStart: getLiveDealers,
    onSuccess: getLiveDealersSuccess,
    onFailure: getLiveDealersFail,
    label: GETLIVEDEALERS,
  });
};

export const updateMohawkInvoiceDateApi = (invoiceDate, id) => {
  const apiUrl = `/shipstation-api/orders/mohawk-invoice-date/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: updateMohawkInvoiceDate,
    onSuccess: updateMohawkInvoiceDateSuccess,
    onFailure: updateMohawkInvoiceDateFail,
    data: invoiceDate,
    label: UPDATEMOHAWKINVOICEDATE,
  });
};

export const updateDealerLocationApi = (id, updateData) => {
  const apiUrl = `/shipstation-api/orders/livedealer/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'PUT',
    accessToken: token,
    onStart: updateDealerLocation,
    onSuccess: updateDealerLocationSuccess,
    onFailure: updateDealerLocationFail,
    data: updateData,
    label: UPDATEDEALERLOCATION,
  });
};

export const deleteDealerLocationApi = (id, updateData) => {
  const apiUrl = `/shipstation-api/orders/livedealer/${id}`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'DELETE',
    accessToken: token,
    onStart: deleteDealerLocation,
    onSuccess: deleteDealerLocationSuccess,
    onFailure: deleteDealerLocationFail,
    label: DELETEDEALERLOCATION,
  });
};

export const addDealerLocationApi = values => {
  const apiUrl = `/shipstation-api/orders/addlivedealer`;
  const token = getToken();

  return apiAction({
    url: apiUrl,
    method: 'POST',
    accessToken: token,
    onStart: addDealerLocation,
    onSuccess: addDealerLocationSuccess,
    onFailure: addDealerLocationFail,
    data: values,
    label: ADDDEALERLOCATION,
  });
};

//Order-Notes-

export const saveOrderNotes = (data, id) => {
  const apiUrl = `/shipstation-api/orders/notes/${id}`;
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

export const fetchOrderNotes = id => {
  const apiUrl = `/shipstation-api/orders/getnotes/${id}`;
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

export const putOrderNote = (data, id, order) => {
  const apiUrl = `/shipstation-api/orders/updatenote/${id}/${order}`;
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

export const deleteOrderNoteRequest = (id, order) => {
  const apiUrl = `/shipstation-api/orders/deletenote/${id}/${order}`;
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

export const getSocketOrderList = createAction(GETSOCKETORDERLIST);

export const OrderHistoryReducer = handleActions(
  {
    ...requestLoopHandlers({
      action: GETORDERLIST,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderhistorylist: payload,
          getting_orderlist_state: REQUEST_STATUS.SUCCESS,
          deleting_state: REQUEST_STATUS.INITIAL,
        };
      },
      stateField: 'getting_orderlist_state',
    }),

    ...requestLoopHandlers({
      action: GETORDERBYID,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderDataById: payload,
          getting_orderbyid_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'getting_orderbyid_state',
    }),

    ...requestLoopHandlers({
      action: UPLOADMHKINVOICEFILE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderhistorylist: state.orderhistorylist.map((item, index) => {
            if (item._id !== payload._id) {
              return item;
            }
            return {
              ...item,
              ...payload,
            };
          }),
          orderDataById: payload,
          uploading_mhkinvoice_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'uploading_mhkinvoice_state',
    }),

    ...requestLoopHandlers({
      action: MHKPOFILEUPDATE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderDataById: payload,
          updating_pofile_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'updating_pofile_state',
    }),

    ...requestLoopHandlers({
      action: SHIPPINGMKTORDER,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderhistorylist: state.orderhistorylist.map((item, index) => {
            if (item._id !== payload._id) {
              return item;
            }
            return {
              ...item,
              ...payload,
            };
          }),
          state: REQUEST_STATUS.SUCCESS,
        };
      },
    }),

    ...requestLoopHandlers({
      action: ORDERLISTUPLOADFILE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          // orderhistorylist: state.orderhistorylist.map(item => {
          //   var udtorder = item;
          //   payload.forEach(e => {
          //     if (e._id === item._id) {
          //       udtorder = e;
          //     }
          //   });
          //   if (JSON.stringify(udtorder) === JSON.stringify(item)) {
          //     return item;
          //   } else {
          //     return udtorder;
          //   }
          // }),
          error: {},
          getting_orderlist_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'getting_orderlist_state',
    }),

    ...requestLoopHandlers({
      action: DELETEORDER,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your Order(#${payload.order_number}) has Been Successfully Deleted`,
          'success'
        );
        return {
          ...state,
          error: {},
          orderhistorylist: state.orderhistorylist.filter(
            n => n._id !== payload._id
          ),
          deleting_state: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        notification('Error', payload.message, 'danger');
        return {
          ...state,
          deleting_state: REQUEST_STATUS.FAIL,
          error: payload.message,
        };
      },
      stateField: 'deleting_state',
    }),

    ...requestLoopHandlers({
      action: EDITORDER,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your Order(#${payload.order_number}) has Been Successfully Updated`,
          'success'
        );
        return {
          ...state,
          error: {},
          orderDataById: payload,
          editing_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'editing_state',
    }),

    ...requestLoopHandlers({
      action: UPLOADORDERDATABYID,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your Order(#${payload.cust_ref}) has Been Successfully Updated`,
          'success'
        );
        return {
          ...state,
          error: {},
          orderDataById: payload,
          uploading_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'uploading_state',
    }),

    ...requestLoopHandlers({
      action: GETSHAREDORDERINFO,
      onSuccess: (state, payload) => {
        return {
          ...state,
          sharedOrderInfo: payload,
          get_sharedorder_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'get_sharedorder_state',
    }),

    ...requestLoopHandlers({
      action: UPDATESHAREDORDERINFO,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your order(#${
            payload.order_number
          }) has been successfully ${payload.mohawk_order_status.toString()}`,
          'success'
        );

        return {
          ...state,
          sharedOrderInfo: payload,
          update_sharedorder_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'update_sharedorder_state',
    }),

    ...requestLoopHandlers({
      action: REJECTEDORDERINFO,
      onSuccess: (state, payload) => {
        notification(
          'Rejected',
          `Your order(#${
            payload.order_number
          }) has been ${payload.mohawk_order_status.toString()}`,
          'danger'
        );

        return {
          ...state,
          sharedOrderInfo: payload,
          reject_sharedorder_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'reject_sharedorder_state',
    }),

    ...requestLoopHandlers({
      action: REINSTATEORDERINFO,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your order(#${payload.order_number}) has been sent a email to reinstate`,
          'success'
        );

        return {
          ...state,
          orderDataById: payload,
          reinstate_order_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'reinstate_order_state',
    }),

    ...requestLoopHandlers({
      action: RELEASEORDERINFO,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `Your order(#${payload.order_number}) has been successfully released`,
          'success'
        );

        return {
          ...state,
          orderDataById: payload,
          release_order_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'release_order_state',
    }),

    ...requestLoopHandlers({
      action: GETLIVEDEALERS,
      onSuccess: (state, payload) => {
        return {
          ...state,
          livedealers: payload,
          getting_livedealers_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'getting_livedealers_state',
    }),

    ...requestLoopHandlers({
      action: UPDATEMOHAWKINVOICEDATE,
      onSuccess: (state, payload) => {
        return {
          ...state,
          orderhistorylist: state.orderhistorylist.map((item, index) => {
            if (item._id !== payload._id) {
              return item;
            }
            return {
              ...item,
              ...payload,
            };
          }),
          update_mohawkinvoicedate_state: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'update_mohawkinvoicedate_state',
    }),

    ...requestLoopHandlers({
      action: UPDATEDEALERLOCATION,
      onSuccess: (state, payload) => {
        return {
          ...state,
          livedealers: state.livedealers.map((item, index) => {
            if (item._id !== payload._id) {
              return item;
            }
            return {
              ...item,
              ...payload,
            };
          }),
          updating_dealer_location: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'updating_dealer_location',
    }),

    ...requestLoopHandlers({
      action: DELETEDEALERLOCATION,
      onSuccess: (state, payload) => {
        notification(
          'success',
          `${payload.ship_company} has Been Successfully Deleted`,
          'success'
        );
        return {
          ...state,
          error: {},
          livedealers: state.livedealers.filter(n => n._id !== payload._id),
          deleting_dealer_location: REQUEST_STATUS.SUCCESS,
        };
      },
      onFail: (state, payload) => {
        notification('Error', payload.message, 'danger');
        return {
          ...state,
          deleting_dealer_location: REQUEST_STATUS.FAIL,
          error: payload.message,
        };
      },
      stateField: 'deleting_dealer_location',
    }),

    ...requestLoopHandlers({
      action: ADDDEALERLOCATION,
      onSuccess: (state, payload) => {
        return {
          ...state,
          livedealers: [...state.livedealers, payload],
          adding_dealer_location: REQUEST_STATUS.SUCCESS,
        };
      },
      stateField: 'adding_dealer_location',
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
          deleting_state: REQUEST_STATUS.FAIL,
          error: {},
        };
      },
      stateField: 'deleting_state',
    }),

    [GETSOCKETORDERLIST]: (state, { payload }) => {
      return {
        ...state,
        orderhistorylist: payload,
      };
    },
  },
  initialState
);
