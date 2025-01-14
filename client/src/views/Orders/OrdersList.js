import React, { useEffect } from 'react';
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
import PrivacyUploadModal from '../../components/PrivacyUploadModal/PrivacyUploadModal';
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
  uploadOrderListFile,
} from '../../reducers/OrderHistory';
import { isPending, hasSucceeded } from '../../utils/state';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import MHKInvoiceModal from '../../components/MHKInvoiceModal';
import MohawkInvoiceModal from '../../components/MohawkInvoiceModal';
import MKTPaidModal from '../../components/MKTPaidModal';

import { isAdmin, isWorker, isDealer, isEmployee } from '../../_helpers/helper';

import { itemAdminCollection, itemDearCollection } from '../../_config/constants';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './Orders.scss';
import { useState } from 'react';

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

  const [shippingStatus, setShippingStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentFilterList, setPaymentFilterList] = useState([]);
  const [shippingFilterList, setShippingFilterList] = useState([]);
  const [filteredOrderHistoryList, setFilteredOrderHistoryList] = useState([]);

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

  useEffect(() => {
    dispatch(
      fetchOrderHistoryList(
        isDealer(user.roles)
          ? user.mohawkAccount
          : user.roles === 'vacuum-dealer'
          ? user.vacuumAccount
          : isEmployee(user.roles)
          ? user.vacuumAccount
            ? user.vacuumAccount
            : user.mohawkAccount
          : null
      )
      // fetchOrderHistoryList(
      //   isDealer(user.roles)
      //     ? user.mohawkAccount
      //     : isEmployee(user.roles)
      //     ? user.mohawkAccount
      //     : user.roles === 'vacuum-dealer'
      //     ? user.vacuumAccount
      //     : isEmployee(user.roles)
      //     ? user.vacuumAccount
      //     : null
      // )
    );
  }, []);

  useEffect(() => {
    filteredOrderHistoryList.forEach(order => {
      if (order.vacuum_account_number) {
        order['mohawk_account_number'] = order.vacuum_account_number;
      }
    });
  }, [filteredOrderHistoryList]);

  useEffect(() => {
    setFilteredOrderHistoryList(orderhistorylist);
    setPaymentFilterList(orderhistorylist);
    setShippingFilterList(orderhistorylist);
  }, [orderhistorylist]);

  const onUploadMHKInvoiceFile = data => {
    dispatch(uploadMHKInvoicFileApi(data));
  };

  const onUploadOrdersFile = file => {
    dispatch(uploadOrderListFile(file));
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

  // const mktBtnManager = row => {
  //   return (
  //     isAdmin(user.roles) &&
  //     row.payment_type.toLowerCase() !== 'mohawk' &&
  //     row.tracking_number === undefined && (
  //       <MKTPaidModal
  //         state={state}
  //         shippingMKTOrder={v => shippingMKTOrder(row._id, v)}
  //       />
  //     )
  //   );
  // };

  // const shippingMKTOrder = (id, trackingNumber) => {
  //   // console.log(id, trackingNumber);
  //   dispatch(fetchShippingMKTOrder(id, trackingNumber));
  // };

  const actionFormatter = (cell, row) => {
    return (
      <div className="text-center d-inline-block">
        <div>{mohawkBtnManager(row)} </div>

        {/* {getOrderTypefromCustRef(row.order_number) === 'MKT' && (
          <div className="mt-1"> {mktBtnManager(row)}</div>
        )} */}
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

  const onExportFile = () => {
    if (isWorker(user.roles)) {
      dealerExportFile();
    } else {
      adminExportFile();
    }
  };

  const adminExportFile = () => {
    let data = filteredOrderHistoryList;

    data.forEach(order => {
      let notesToDownload = '';
      for (let item in order.notes) {
        notesToDownload = notesToDownload + order.notes[item].note + '\n';
      }
      order.items.forEach((item, index) => {
        let itemArray = [
          order.order_number,
          moment(order.created)
            .tz('America/New_York')
            .format('MM/DD/YY hh:mm A z'),
          order.order_number.split('.')[1] === 'DS'
            ? order.bill_company
            : order.ship_company,
          order.mohawk_account_number,
          item.name,
          item.item,
          item.price,
          item.quantity,
          Number(Number(item.price) * Number(item.quantity)).toFixed(2) * 1.0,
          index === 0 ? Number(order.discount).toFixed(2) * 1.0 : 0.0,
          0.0,
          index === 0
            ? Number(
                Number(Number(item.price) * Number(item.quantity)) -
                  Number(order.discount)
              ).toFixed(2) * 1.0
            : Number(Number(item.price) * Number(item.quantity)).toFixed(2) *
              1.0,
          order.ship_first_name,
          order.ship_last_name,
          order.ship_address_1,
          order.ship_address_2,
          order.ship_city,
          order.ship_state,
          order.ship_zip,
          order.ship_phone,
          order.dealer_email,
          order.order_number.split('.')[1] === 'DS' ? order.ship_e_mail : '',
          order.payment_type.toLowerCase() === 'freepaid'
            ? 'No Charge'
            : order.payment_type.toLowerCase() === 'stripe'
            ? 'paid'
            : order.mohawk_order_paid_date === undefined
            ? 'Mohawk-UNPAID'
            : 'Mohawk-PAID',
          order.payment_type.toLowerCase() === 'mohawk'
            ? 'Invoiced through Mohawk'
            : order.payment_type.toLowerCase() === 'stripe'
            ? 'Credit/Debit Card'
            : order.payment_type.toLowerCase() === 'freepaid'
            ? 'No Charge'
            : null,
          order.order_status.toLowerCase() === 'awaiting_shipment' ||
          order.order_status.toLowerCase() === 'process'
            ? 'In Process'
            : order.order_status.toLowerCase() === 'shipped'
            ? 'Shipped'
            : order.order_status,
          order.order_status.toLowerCase() === 'shipped'
            ? moment(order.shipped_date).format('MM/DD/YY')
            : null,
          order.mohawk_order_invoice_number,
          order.mohawk_order_paid_date !== undefined
            ? moment(order.mohawk_order_paid_date).format('MM/DD/YY hh:mm A z')
            : null,
          order.payment_type.toLowerCase() === 'mohawk'
            ? order.mohawk_po_number
            : null,
          order.payment_type.toLowerCase() === 'mohawk'
            ? order.mohawk_po_manager
            : null,
          order.tracking_number,
          notesToDownload,
        ];

        itemAdminCollection.push(itemArray);
      });
    });

    const wb = XLSX.utils.book_new();
    const wsAll = XLSX.utils.aoa_to_sheet(itemAdminCollection);

    var newDate = new Date();
    let filename =
      parseInt(newDate.getMonth() + 1) +
      '-' +
      newDate.getDate() +
      '-' +
      newDate.getFullYear() +
      '-' +
      newDate.getTime();

    XLSX.utils.book_append_sheet(wb, wsAll, 'All Users');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const dealerExportFile = () => {
    let data = filteredOrderHistoryList;

    data.forEach(order => {
      order.items.forEach(item => {
        let itemArray = [
          order.order_number,
          moment(order.created)
            .tz('America/New_York')
            .format('MM/DD/YY hh:mm A z'),
          order.order_number.split('.')[1] === 'DS'
            ? order.bill_company
            : order.ship_company,
          order.mohawk_account_number,
          item.item,
          item.item,
          item.price,
          item.quantity,
          Number(order.sub_total).toFixed(2) * 1.0,
          order.discount,
          0,
          Number(Number(order.sub_total) - Number(order.discount)).toFixed(2) *
            1.0,
          order.ship_first_name,
          order.ship_last_name,
          order.ship_address_1,
          order.ship_address_2,
          order.ship_city,
          order.ship_state,
          order.ship_zip,
          order.ship_phone,
          order.dealer_email,
          order.order_number.split('.')[1] === 'DS' ? order.ship_e_mail : '',
          order.payment_type.toLowerCase() === 'stripe' ||
          order.payment_type.toLowerCase() === 'mkt'
            ? 'paid'
            : order.payment_type,
          order.payment_type.toLowerCase() === 'mohawk'
            ? 'Invoiced through Mohawk'
            : order.payment_type.toLowerCase() === 'stripe' ||
              order.payment_type.toLowerCase() === 'mkt'
            ? 'Credit/Debit Card'
            : null,
          order.order_status.toLowerCase() === 'awaiting_shipment' ||
          order.order_status.toLowerCase() === 'process'
            ? 'In Process'
            : order.order_status.toLowerCase() === 'shipped'
            ? 'Shipped'
            : order.order_status,
          order.tracking_number,
        ];
        itemDearCollection.push(itemArray);
      });
    });

    const wb = XLSX.utils.book_new();
    const wsAll = XLSX.utils.aoa_to_sheet(itemDearCollection);

    var newDate = new Date();
    let filename =
      parseInt(newDate.getMonth() + 1) +
      '-' +
      newDate.getDate() +
      '-' +
      newDate.getFullYear() +
      '-' +
      newDate.getTime();

    XLSX.utils.book_append_sheet(wb, wsAll, 'All Users');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const defaultSorted = [
    {
      dataField: 'created', // if dataField is not match to any column you defined, it will be ignored.
      order: 'desc', // desc or asc
    },
  ];

  const columns = [
    {
      dataField: 'order_number',
      text: 'Order #',
      align: 'left',
      headerAlign: 'left',
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
      formatter: (cell, row) => {
        return row.order_number.split('.')[1] === 'DS'
          ? row.bill_company
          : row.ship_company;
      },
      align: 'left',
      headerAlign: 'left',
      sort: true,
    },
    {
      dataField: 'mohawk_account_number',
      text: 'Acct #',
      formatter: (cell, row) => {
        return !isEmployee(user.roles) ? (
          <Link to={`/profile/account/${row.createdBy}`}> {cell}</Link>
        ) : (
          cell
        );
      },
      align: 'right',
      headerAlign: 'right',
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
      searchable: true,
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
    {
      dataField: '',
      text: 'Action',
      formatter: actionFormatter,
      align: 'center',
      headerAlign: 'center',
      headerStyle: () => {
        return { width: '17%' };
      },
      searchable: false,
    },
  ];

  const options = {
    sizePerPageRenderer,
    totalSize: orderhistorylist.length,
  };

  const handleShippingChange = async e => {
    let val = e.target.value;
    setShippingStatus(val);

    let temp = orderhistorylist.filter(item => {
      if (val === 'Shipped') return item.order_status === 'shipped';
      else if (val === 'In Process')
        return (
          item.order_status !== 'shipped' &&
          ((isAdmin(user.roles) &&
            item.payment_type.toLowerCase() === 'mohawk' &&
            item.mohawk_order_status === 'released') ||
            (!isAdmin(user.roles) &&
              item.payment_type.toLowerCase() === 'mohawk' &&
              item.mohawk_order_status === 'released' &&
              item.mohawk_order_status === 'approved') ||
            item.payment_type.toLowerCase() !== 'mohawk')
        );
      else if (val === 'Hold-ZNTH-Pending')
        return (
          item.order_status !== 'shipped' &&
          isAdmin(user.roles) &&
          item.payment_type.toLowerCase() === 'mohawk' &&
          item.mohawk_order_status === 'approved'
        );
      else if (val === 'Cancelled')
        return (
          item.order_status !== 'shipped' &&
          !isAdmin(user.roles) &&
          item.payment_type.toLowerCase() === 'mohawk' &&
          item.mohawk_order_status === 'rejected'
        );
      else if (val === 'Hold-MHK-Pending')
        return (
          item.order_status !== 'shipped' &&
          isAdmin(user.roles) &&
          item.payment_type.toLowerCase() === 'mohawk' &&
          item.mohawk_order_status !== 'released' &&
          item.mohawk_order_status !== 'approved' &&
          item.mohawk_order_status !== 'rejected'
        );
      else if (val === 'Hold-Pending')
        return (
          item.order_status !== 'shipped' &&
          !isAdmin(user.roles) &&
          item.payment_type.toLowerCase() === 'mohawk' &&
          item.mohawk_order_status !== 'released' &&
          item.mohawk_order_status !== 'approved' &&
          item.mohawk_order_status !== 'rejected'
        );
    });

    setShippingFilterList(temp);
  };

  const handlePaymentChange = async e => {
    let val = e.target.value;
    setPaymentStatus(val);

    let temp = orderhistorylist.filter(item => {
      if (val === 'Paid')
        return item.payment_type === 'stripe' || item.payment_type === 'mkt';
      else if (val === 'Mohawk-UNPAID')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type === 'mohawk' &&
          isAdmin(user.roles) &&
          item.mohawk_order_status === 'released' &&
          (item.mohawk_order_invoice_file === undefined ||
            item.mohawk_order_paid_date === undefined)
        );
      else if (val === 'Mohawk-PAID')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type === 'mohawk' &&
          isAdmin(user.roles) &&
          item.mohawk_order_status === 'released' &&
          item.mohawk_order_invoice_file !== undefined &&
          item.mohawk_order_paid_date !== undefined
        );
      else if (val === 'Mohawk-Approved')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type === 'mohawk' &&
          item.mohawk_order_status === 'approved'
        );
      else if (val === 'Mohawk-Not Approved')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type === 'mohawk' &&
          item.mohawk_order_status === 'rejected'
        );
      else if (val === 'Mohawk-Released')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          !isAdmin(user.roles) &&
          item.payment_type === 'mohawk' &&
          item.mohawk_order_status === 'released'
        );
      else if (val === 'Mohawk-Pending')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type === 'mohawk' &&
          item.mohawk_order_status !== 'approved' &&
          !item.mohawk_order_status !== 'released' &&
          !item.mohawk_order_status !== 'rejected' &&
          item.mohawk_order_status === 'pending'
        );
      else if (val === 'No Charge')
        return (
          item.payment_type !== 'stripe' &&
          item.payment_type !== 'mkt' &&
          item.payment_type !== 'mohawk'
        );
    });
    setPaymentFilterList(temp);
  };

  useEffect(() => {
    let filteredArray = [];
    filteredArray = shippingFilterList.filter(value =>
      paymentFilterList.includes(value)
    );
    setFilteredOrderHistoryList(filteredArray);
  }, [shippingFilterList, paymentFilterList]);

  return (
    <div className="animated fadeIn Orders">
      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col xs={6}>
              <h5 className="font-weight-normal">Order History</h5>
            </Col>
            <Col xs={6}>
              {hasSucceeded(getting_orderlist_state) && (
                <>
                  <Button
                    onClick={onExportFile}
                    className="btn btn-sm btn-success mr-1 float-right"
                  >
                    <i className="fa fa-save"></i> Download Order Report
                  </Button>
                  {/* {
                    <div className="float-right mr-1">
                      <PrivacyUploadModal
                        uploadFile={onUploadOrdersFile}
                        state={state}
                        type="xlsx"
                      />
                    </div>
                  } */}
                </>
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {isPending(getting_orderlist_state) ? (
            <LoadingIndicator />
          ) : (
            <>
              <ToolkitProvider
                // data={orderhistorylist}
                data={filteredOrderHistoryList}
                columns={columns}
                keyField="cust_ref"
                search
                bootstrap4
              >
                {/* <select
                  class="form-control"
                  id="sel1"
                  value={this.state.formValues.selectedWinnerOption}
                  onChange={(event) =>
                    this.handleChange(event, "selectedWinnerOption")
                  }
                >
                  {Object.keys(this.state.selectionOfWinner).map(
                    (value) => (
                      <option
                        value={value}
                        id={this.state.selectionOfWinner[value]}
                      >
                        {this.state.selectionOfWinner[value]}
                      </option>
                    )
                  )}
                </select> */}
                {(props, idx) => (
                  <div key={idx}>
                    <div className="row">
                      <div className="col-md-6">
                        <SearchBar {...props.searchProps} />
                      </div>
                      <div className="col-md-3">
                        <select
                          name="Payment status"
                          id="payment"
                          value={paymentStatus}
                          className="form-control"
                          onChange={event => handlePaymentChange(event)}
                        >
                          {!paymentStatus ? (
                            <option value="" hidden>
                              Payment status
                            </option>
                          ) : null}
                          <option value="Paid">Paid</option>
                          <option value="Mohawk-UNPAID">Mohawk-UNPAID</option>
                          <option value="Mohawk-PAID">Mohawk-PAID</option>
                          <option value="Mohawk-Approved">
                            Mohawk-Approved
                          </option>
                          <option value="Mohawk-Not Approved">
                            Mohawk-Not Approved
                          </option>
                          <option value="Mohawk-Pending">Mohawk-Pending</option>
                          <option value="Mohawk-Released">
                            Mohawk-Released
                          </option>
                          <option value="No Charge">No Charge</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <select
                          name="Shipping status"
                          id="shipping"
                          value={shippingStatus}
                          className="form-control"
                          onChange={event => handleShippingChange(event)}
                        >
                          {!shippingStatus ? (
                            <option value="" hidden>
                              Shipping status
                            </option>
                          ) : null}
                          <option value="Shipped">Shipped</option>
                          <option value="In Process">In Process</option>
                          <option value="Hold-ZNTH-Pending">
                            Hold-ZNTH-Pending
                          </option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Hold-MHK-Pending">
                            Hold-MHK-Pending
                          </option>
                          <option value="Hold-Pending">Hold-Pending</option>
                        </select>
                      </div>
                    </div>
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
                          {/* <BootstrapTable keyField='id' data={orderhistorylist} columns={columns} filter={filterFactory()} /> */}
                        </div>
                      )}
                    </PaginationProvider>
                  </div>
                )}
              </ToolkitProvider>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrdersList;
