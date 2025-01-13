import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Row,
  Col,
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import PrivacyUploadModal from '../../../../components/PrivacyUploadModal/PrivacyUploadModal';
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone,
} from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import {
  fetchOrderHistoryList,
  uploadMHKInvoicFileApi,
  fetchShippingMKTOrder,
  updateMohawkInvoiceDateApi,
} from '../../../../reducers/OrderHistory';
import { isPending, hasSucceeded } from '../../../../utils/state';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import MHKInvoiceModal from '../../../../components/MHKInvoiceModal';
import MohawkInvoiceModal from '../../../../components/MohawkInvoiceModal';
import MKTPaidModal from '../../../../components/MKTPaidModal';

import { getOrderTypefromCustRef } from '../../../../_helpers/helper';
import { isAdmin } from '../../../../_helpers/helper';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
// import './Orders.scss';

const { SearchBar } = Search;

const sizePerPageRenderer = ({
  options,
  currSizePerPage,
  onSizePerPageChange,
}) => (
  <div className="btn-group" role="group">
    {options.map(option => {
      const isSelect = currSizePerPage === `${option.page}`;
      return (
        <button
          key={option.text}
          type="button"
          onClick={() => onSizePerPageChange(option.page)}
          className={`btn ${isSelect ? 'btn-secondary' : 'btn-primary'}`}
        >
          {option.text}
        </button>
      );
    })}
  </div>
);

const OrdersList = ({ history }) => {
  const dispatch = useDispatch();
  const [temp, setTemp] = useState(false);

  const getting_orderlist_state = useSelector(
    state => state.orderhistory.getting_orderlist_state
  );
  const update_mohawkinvoicedate_state = useSelector(
    state => state.orderhistory.update_mohawkinvoicedate_state
  );

  const uploading_mhkinvoice_state = useSelector(
    state => state.orderhistory.uploading_mhkinvoice_state
  );

  const state = useSelector(state => state.orderhistory.state);

  const orderhistorylist = useSelector(
    state => state.orderhistory.orderhistorylist
  );

  const user = useSelector(state => state.auth.user);

  const accountData = useSelector(state => state.account.accountData);

  useEffect(() => {
    accountData.vacuumAccount
      ? dispatch(fetchOrderHistoryList(accountData.vacuumAccount))
      : dispatch(fetchOrderHistoryList(accountData.mohawkAccount));
  }, []);

  useEffect(() => {
    orderhistorylist.forEach(order => {
      if (order.vacuum_account_number) {
        order['mohawk_account_number'] = order.vacuum_account_number;
      }
    });
    setTemp(true);
  }, [orderhistorylist]);

  const onUploadMHKInvoiceFile = data => {
    dispatch(uploadMHKInvoicFileApi(data));
  };

  const mohawkUpdateInvoiceDate = (date, id) => {
    dispatch(updateMohawkInvoiceDateApi(date, id));
  };

  const mohawkBtnManager = row => {
    if (isAdmin(user.roles)) {
      if (row.payment_type.toLowerCase() === 'mohawk') {
        if (
          row.mohawk_order_status === 'released' &&
          row.mohawk_order_invoice_file === undefined
        ) {
          return (
            <MHKInvoiceModal
              uploadFile={onUploadMHKInvoiceFile}
              orderId={row._id}
              state={uploading_mhkinvoice_state}
              btnText="Upload Invoice"
            />
          );
        } else if (
          row.mohawk_order_status === 'released' &&
          row.mohawk_order_invoice_file !== undefined &&
          row.mohawk_order_paid_date === undefined
        ) {
          return (
            <MohawkInvoiceModal
              onSubmitHandler={mohawkUpdateInvoiceDate}
              orderId={row._id}
              state={update_mohawkinvoicedate_state}
            />
          );
        }
      }
    }
  };

  const mktBtnManager = row => {
    return (
      isAdmin(user.roles) &&
      row.tracking_number === undefined && (
        <MKTPaidModal
          state={state}
          shippingMKTOrder={v => shippingMKTOrder(row._id, v)}
        />
      )
    );
  };

  const shippingMKTOrder = (id, trackingNumber) => {
    // console.log(id, trackingNumber);
    dispatch(fetchShippingMKTOrder(id, trackingNumber));
  };

  const actionFormatter = (cell, row) => {
    return (
      <div className="text-center d-inline-block">
        <div>{mohawkBtnManager(row)} </div>

        {getOrderTypefromCustRef(row.order_number) === 'MKT' && (
          <div className="mt-1"> {mktBtnManager(row)}</div>
        )}
        <div>
          <Button
            onClick={() => history.push(`/order/${row._id}`)}
            color="info"
            size="sm"
            className="mt-1 text-white"
          >
            Details
          </Button>
        </div>
      </div>
    );
  };

  const paymentFormatter = (cell, row) => {
    if (cell === 'stripe' || cell === 'mkt') {
      return (
        <h5>
          <Badge color="primary" pill>
            Paid
          </Badge>
        </h5>
      );
    } else if (cell.toLowerCase() === 'mohawk') {
      if (isAdmin(user.roles)) {
        if (row.mohawk_order_status === 'released') {
          if (
            row.mohawk_order_invoice_file === undefined ||
            row.mohawk_order_paid_date === undefined
          ) {
            return (
              <h5>
                <Badge color="danger" pill>
                  Mohawk-UNPAID
                </Badge>
              </h5>
            );
          } else if (
            row.mohawk_order_invoice_file !== undefined &&
            row.mohawk_order_paid_date !== undefined
          ) {
            return (
              <h5>
                <Badge color="success" pill>
                  Mohawk-PAID
                </Badge>
              </h5>
            );
          }
        } else if (row.mohawk_order_status === 'approved') {
          return (
            <h5>
              <Badge color="success" pill>
                Mohawk-Approved
              </Badge>
            </h5>
          );
        } else if (row.mohawk_order_status === 'rejected') {
          return (
            <h5>
              <Badge color="danger" pill>
                Mohawk-Not Approved
              </Badge>
            </h5>
          );
        } else {
          return (
            <h5>
              <Badge color="warning" pill>
                Mohawk-Pending
              </Badge>
            </h5>
          );
        }
      } else {
        if (row.mohawk_order_status === 'released') {
          return (
            <h5>
              <Badge color="success" pill>
                Mohawk-Released
              </Badge>
            </h5>
          );
        } else if (row.mohawk_order_status === 'approved') {
          return (
            <h5>
              <Badge color="success" pill>
                Mohawk-Approved
              </Badge>
            </h5>
          );
        } else if (row.mohawk_order_status === 'rejected') {
          return (
            <h5>
              <Badge color="danger" pill>
                Mohawk-Not Approved
              </Badge>
            </h5>
          );
        } else {
          return (
            <h5>
              <Badge color="warning" pill>
                Mohawk-Pending
              </Badge>
            </h5>
          );
        }
      }
    } else {
      return (
        <h5>
          <Badge color="success" pill>
            No Charge
          </Badge>
        </h5>
      );
    }
  };

  const shippingFormatter = (cell, row) => {
    if (cell.toLowerCase() === 'shipped') {
      return (
        <h5>
          <Badge color="success" className="text-white" pill>
            Shipped
          </Badge>
        </h5>
      );
    } else {
      if (row.payment_type.toLowerCase() === 'mohawk') {
        if (isAdmin(user.roles)) {
          if (row.mohawk_order_status === 'released') {
            return (
              <h5>
                <Badge color="info" className="text-white" pill>
                  In Process
                </Badge>
              </h5>
            );
          } else if (row.mohawk_order_status === 'approved') {
            return (
              <h5>
                <Badge color="danger" pill>
                  Hold-ZNTH-Pending
                </Badge>
              </h5>
            );
          } else if (row.mohawk_order_status === 'rejected') {
            return (
              <h5>
                <Badge color="danger" pill>
                  Cancelled
                </Badge>
              </h5>
            );
          } else {
            return (
              <h5>
                <Badge color="warning" pill>
                  Hold-MHK-Pending
                </Badge>
              </h5>
            );
          }
        } else {
          if (row.mohawk_order_status === 'released') {
            return (
              <h5>
                <Badge color="success" pill>
                  In Process
                </Badge>
              </h5>
            );
          } else if (row.mohawk_order_status === 'approved') {
            return (
              <h5>
                <Badge color="success" pill>
                  In Process
                </Badge>
              </h5>
            );
          } else if (row.mohawk_order_status === 'rejected') {
            return (
              <h5>
                <Badge color="danger" pill>
                  Cancelled
                </Badge>
              </h5>
            );
          } else {
            return (
              <h5>
                <Badge color="warning" pill>
                  Hold-Pending
                </Badge>
              </h5>
            );
          }
        }
      } else {
        return (
          <h5>
            <Badge color="info" className="text-white" pill>
              In Process
            </Badge>
          </h5>
        );
      }
    }
  };

  const dateFormatter = (cell, row) => {
    return moment(cell)
      .tz('America/New_York')
      .format('MM/DD/YY hh:mm A z');
  };

  const columns = [
    {
      dataField: 'order_number',
      text: 'Order #',
      align: 'left',
      headerAlign: 'left',
      formatter: (cell, row) => {
        return <Link to={`/order/${row._id}`}>{cell}</Link>;
      },
      headerStyle: () => {
        return { width: '10%' };
      },
      sort: true,
    },
    {
      dataField: 'created',
      text: 'Order Date',
      formatter: dateFormatter,
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '20%' };
      },
      sort: true,
      searchable: false,
    },
    {
      dataField: 'ship_company',
      text: 'Company',
      align: 'left',
      headerAlign: 'left',
      sort: true,
    },
    {
      dataField: 'mohawk_account_number',
      text: 'Acct #',
      // formatter: (cell, row) => {
      //   return <div>{cell}</div>;
      // },
      align: 'left',
      headerAlign: 'left',
      sort: true,
      headerStyle: () => {
        return { width: '10%' };
      },
    },
    {
      dataField: 'payment_type',
      text: 'Payment Status',
      formatter: paymentFormatter,
      align: 'center',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '15%' };
      },
      sort: true,
      searchable: false,
    },
    {
      dataField: 'order_status',
      text: 'Shipping Status',
      formatter: shippingFormatter,
      align: 'center',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '10%' };
      },
      sort: true,
      searchable: false,
    },
    {
      dataField: 'sub_total',
      text: 'Total',
      formatter: (cell, row) => {
        if (row.payment_type === 'No Charge') {
          return `$0.00`;
        } else {
          return `$${Number(Number(cell - row.discount)).toFixed(2)}`;
        }
      },
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '10%' };
      },
      sort: true,
      searchable: false,
    },
  ];

  const onPlaceOrder = () => {
    history.push(`/sales/${accountData._id}`);
  };

  const options = {
    sizePerPageRenderer,
    totalSize: orderhistorylist.length,
  };

  const defaultSorted = [
    {
      dataField: 'created', // if dataField is not match to any column you defined, it will be ignored.
      order: 'desc', // desc or asc
    },
  ];

  return (
    <div className="animated fadeIn Orders mt-4">
      {isPending(getting_orderlist_state) ? (
        <LoadingIndicator />
      ) : (
        <>
          <Button
            size="sm"
            color="danger"
            className="float-right mb-2"
            onClick={onPlaceOrder}
          >
            Place an Order
          </Button>
          <ToolkitProvider
            data={orderhistorylist}
            columns={columns}
            keyField="cust_ref"
            search
            bootstrap4
          >
            {props => (
              <div>
                <PaginationProvider pagination={paginationFactory(options)}>
                  {({ paginationProps, paginationTableProps }) => (
                    <div>
                      <PaginationTotalStandalone {...paginationProps} />
                      <BootstrapTable
                        {...paginationTableProps}
                        {...props.baseProps}
                        defaultSorted={defaultSorted}
                        wrapperClasses="table-responsive"
                      />
                    </div>
                  )}
                </PaginationProvider>
              </div>
            )}
          </ToolkitProvider>
        </>
      )}
    </div>
  );
};

export default OrdersList;
