import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Row,
  Col,
  Table,
  Button,
} from 'reactstrap';
import moment from 'moment-timezone';
import { Link, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import XLSX from 'xlsx';
import {
  fetchOrderByID,
  deleteOrderApi,
  reinstateOrderInfoApi,
  releaseOrderInfoApi,
  uploadOrderDataApi,
  updatePOFileApi,
  uploadMHKInvoicFileApi,
} from '../../reducers/OrderHistory';
import { isInitial, isPending, hasSucceeded } from '../../utils/state';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import OrderEditModal from '../../components/OrderEditModal';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import PrivacyUploadModal from '../../components/PrivacyUploadModal/PrivacyUploadModal';
// import MHKPOUpdateModal from '../../components/MHKPOUpdateModal';
// import MHKInvoiceModal from '../../components/MHKInvoiceModal';
import Print from './Print';
import { useReactToPrint } from 'react-to-print';
import {
  getUploadedMohawkPdf,
  getOrderTypefromCustRef,
  getUploadedPOfile,
} from '../../_helpers/helper';
import { itemAdminCollection } from '../../_config/constants';
import { isAdmin } from '../../_helpers/helper';
import logo from './images/logo.png';
import Notes from '../Profile/components/Notes';

const OrderDetail = ({ match, release_order_state }) => {
  const componentRef = useRef();
  const [notesUpdated, setNotesUpdated] = useState(false);
  const dispatch = useDispatch();
  const getting_orderbyid_state = useSelector(
    state => state.orderhistory.getting_orderbyid_state
  );

  const orderDataById = useSelector(state => state.orderhistory.orderDataById);
  const reinstate_order_state = useSelector(
    state => state.orderhistory.reinstate_order_state
  );

  const deleting_state = useSelector(
    state => state.orderhistory.deleting_state
  );

  const uploading_state = useSelector(
    state => state.orderhistory.uploading_state
  );

  // const uploading_mhkinvoice_state = useSelector(
  //   state => state.orderhistory.uploading_mhkinvoice_state
  // );

  // const updating_pofile_state = useSelector(
  //   state => state.orderhistory.updating_pofile_state
  // );

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchOrderByID(match.params.id));
    setNotesUpdated(false);
  }, [notesUpdated]);

  const getOrderStatus = status => {
    if (
      orderDataById.payment_type &&
      orderDataById.payment_type.toLowerCase() === 'mohawk'
    ) {
      if (isAdmin(user.roles)) {
        if (
          orderDataById.mohawk_order_status === undefined ||
          orderDataById.mohawk_order_status === 'pending'
        ) {
          return 'Hold-MHK-Pending';
        } else if (orderDataById.mohawk_order_status === 'approved') {
          return 'Hold-ZNTH-Pending';
        } else if (orderDataById.mohawk_order_status === 'rejected') {
          return 'Cancelled';
        } else if (orderDataById.mohawk_order_status === 'released') {
          return status && status.toLowerCase() === 'shipped'
            ? 'Shipped'
            : 'In Process';
        }
      } else {
        if (
          orderDataById.mohawk_order_status === undefined ||
          orderDataById.mohawk_order_status === 'pending'
        ) {
          return 'Hold Pending';
        } else if (orderDataById.mohawk_order_status === 'approved') {
          return 'In Process';
        } else if (orderDataById.mohawk_order_status === 'rejected') {
          return 'Cancelled';
        } else if (orderDataById.mohawk_order_status === 'released') {
          return status && status.toLowerCase() === 'shipped'
            ? 'Shipped'
            : 'In Process';
        }
      }
    } else {
      return status && status.toLowerCase() === 'shipped'
        ? 'Shipped'
        : 'In Process';
    }
  };

  const getPaymentStatus = () => {
    if (isAdmin(user.roles)) {
      if (orderDataById.payment_type === 'stripe') {
        return <>Paid</>;
      } else if (
        orderDataById.payment_type &&
        orderDataById.payment_type.toLowerCase() === 'mohawk'
      ) {
        if (
          orderDataById.mohawk_order_status === undefined ||
          orderDataById.mohawk_order_status === 'pending'
        ) {
          return <>Mohawk-Pending</>;
        } else if (orderDataById.mohawk_order_status === 'approved') {
          return <>Mohawk-Approved</>;
        } else if (orderDataById.mohawk_order_status === 'rejected') {
          return <>Mohawk-Not Approved</>;
        } else if (orderDataById.mohawk_order_status === 'released') {
          if (orderDataById.mohawk_order_paid_date === undefined) {
            return <>Mohawk-UNPAID</>;
          } else {
            return (
              <>
                Mohawk-PAID(
                {moment(orderDataById.mohawk_order_paid_date)
                  .tz('America/New_York')
                  .format('MM/DD/YY')}
                )
              </>
            );
          }
        }
      } else if (orderDataById.payment_type === 'freepaid') {
        return <>No Charge</>;
      }
    } else {
      if (orderDataById.payment_type === 'stripe') {
        return <>Paid</>;
      }
      if (
        orderDataById.payment_type &&
        orderDataById.payment_type.toLowerCase() === 'mohawk'
      ) {
        if (
          orderDataById.mohawk_order_status === undefined ||
          orderDataById.mohawk_order_status === 'pending'
        ) {
          return <>Pending</>;
        } else if (orderDataById.mohawk_order_status === 'approved') {
          return <>Approved</>;
        } else if (orderDataById.mohawk_order_status === 'rejected') {
          return <>Not Approved</>;
        } else if (orderDataById.mohawk_order_status === 'released') {
          return <>Mohawk</>;
        }
      }
    }
  };

  const getTrackingNumbers = () => {
    if (orderDataById.order_status === undefined) {
      return;
    } else if (orderDataById.order_status.toLowerCase() === 'shipped') {
      if (
        orderDataById.carrier_code === 'fedex' ||
        orderDataById.carrier_code === undefined
      ) {
        return (
          <>
            Tracking Numbers: <br />
            <a
              href={`https://www.fedex.com/apps/fedextrack/?tracknumbers=${orderDataById.tracking_number}`}
              className="text-primary mt-1"
              target="_blank"
            >
              {orderDataById.tracking_number}
            </a>
          </>
        );
      } else {
        return (
          <>
            Tracking Numbers:
            <div>
              <a
                href={`https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${orderDataById.tracking_number}`}
                className="text-primary mt-1"
                target="_blank"
              >
                {orderDataById.tracking_number}
              </a>
            </div>
          </>
        );
      }
    }
  };

  const adminExportFile = () => {
    let order = orderDataById;

    let exportReport = itemAdminCollection;
    let notesToDownload = '';

    for (let item in order.notes) {
      notesToDownload = notesToDownload + order.notes[item].note + '\n';
    }
    order.items.forEach(item => {
      let itemArray = [
        order.order_number,
        moment(order.created)
          .tz('America/New_York')
          .format('MM/DD/YY hh:mm A z'),
        order.order_number.split('.')[1] === 'DS'
          ? order.bill_company
          : order.ship_company,
        order.mohawk_account_number || order.vacuum_account_number,
        item.name,
        item.item,
        item.price,
        item.quantity,
        Number(Number(item.price) * Number(item.quantity)).toFixed(2),
        Number(order.discount).toFixed(2),
        0.0,
        Number(
          Number(Number(item.price) * Number(item.quantity)) -
            Number(order.discount)
        ).toFixed(2),
        order.ship_first_name,
        order.ship_last_name,
        order.ship_address_1,
        order.ship_address_2,
        order.ship_city,
        order.ship_state,
        order.ship_zip,
        order.ship_phone,
        order.dealer_email,
        order.order_number.split('.')[1] === 'DS'
          ? order.ship_e_mail
          : order.dealer_email,
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
          : '',
        order.mohawk_order_invoice_number !== undefined
          ? order.mohawk_order_invoice_number
          : null,
        order.mohawk_order_paid_date !== undefined
          ? moment(order.mohawk_order_paid_date).format('MM/DD/YY')
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

      exportReport.push(itemArray);
    });

    const wb = XLSX.utils.book_new();
    const wsAll = XLSX.utils.aoa_to_sheet(exportReport);

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
    while (exportReport.length > 1) {
      exportReport.pop();
    }
  };

  const onUploadFile = file => {
    dispatch(uploadOrderDataApi(orderDataById._id, file));
  };

  const reinstateOrder = () => {
    dispatch(reinstateOrderInfoApi(orderDataById._id));
  };

  const releaseOrder = () => {
    let orderinfo = {};
    orderinfo.cust_company = orderDataById.ship_company;
    orderinfo.cust_first_name = orderDataById.ship_first_name;
    orderinfo.cust_last_name = orderDataById.ship_last_name;
    orderinfo.cust_address_1 = orderDataById.ship_address_1;
    orderinfo.cust_address_2 = orderDataById.ship_address_2;
    orderinfo.cust_city = orderDataById.ship_city;
    orderinfo.cust_state = orderDataById.ship_state;
    orderinfo.cust_zip = orderDataById.ship_zip;
    orderinfo.cust_phone = orderDataById.ship_phone;
    orderinfo.cust_e_mail = orderDataById.ship_e_mail;
    orderinfo.ship_country = 'USA';
    orderinfo.cust_country = 'USA';
    orderinfo.ship_is_billing = false;
    orderinfo.cust_ref = orderDataById.cust_ref;
    orderinfo.ship_first_name = orderDataById.ship_first_name;
    orderinfo.ship_last_name = orderDataById.ship_last_name;
    orderinfo.ship_company = orderDataById.ship_company;
    orderinfo.ship_phone = orderDataById.ship_phone;
    orderinfo.ship_address_1 = orderDataById.ship_address_1;
    orderinfo.ship_address_2 = orderDataById.ship_address_2;
    orderinfo.ship_city = orderDataById.ship_city;
    orderinfo.ship_state = orderDataById.ship_state;
    orderinfo.ship_zip = orderDataById.ship_zip;
    orderinfo.ship_e_mail = orderDataById.ship_e_mail;
    orderinfo.items = orderDataById.items;

    dispatch(releaseOrderInfoApi(orderinfo, orderDataById._id));
  };

  const handleDeleteOrder = orderId => {
    dispatch(deleteOrderApi(orderId));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const onUpdatePoFile = data => {
    dispatch(updatePOFileApi(data));
  };

  const onUploadMHKInvoiceFile = data => {
    dispatch(uploadMHKInvoicFileApi(data));
  };

  return (
    <div className="animated fadeIn">
      {hasSucceeded(deleting_state) && <Redirect to="/orders" />}
      <Card>
        <CardHeader>
          <Row>
            <Col>
              Invoice{' '}
              <strong>
                #
                {isInitial(getting_orderbyid_state) ||
                isPending(getting_orderbyid_state)
                  ? ''
                  : orderDataById.order_number}
              </strong>
              {hasSucceeded(getting_orderbyid_state) && (
                <Button
                  size="sm"
                  color="primary"
                  className="float-right mr-1"
                  onClick={handlePrint}
                >
                  <i className="fa fa-print"></i> Print
                </Button>
              )}
              {hasSucceeded(getting_orderbyid_state) &&
                orderDataById.payment_type &&
                orderDataById.payment_type.toLowerCase() === 'mohawk' &&
                orderDataById.mohawk_order_status === 'approved' && (
                  <ConfirmationModal
                    state={release_order_state}
                    text="RELEASE"
                    size="sm"
                    color="success"
                    header="RELEASE"
                    className="float-right mr-1"
                    icon="fa fa-check"
                    onClickFunc={() => releaseOrder()}
                  />
                )}
              {hasSucceeded(getting_orderbyid_state) &&
                orderDataById.payment_type &&
                orderDataById.payment_type.toLowerCase() === 'mohawk' &&
                orderDataById.mohawk_order_status === 'rejected' && (
                  <ConfirmationModal
                    state={reinstate_order_state}
                    text="REINSTATE"
                    size="sm"
                    color="info"
                    header="REINSTATE"
                    className="float-right mr-1"
                    icon="fa fa-repeat"
                    onClickFunc={() => reinstateOrder()}
                  />
                )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {isInitial(getting_orderbyid_state) ||
          isPending(getting_orderbyid_state) ? (
            <LoadingIndicator />
          ) : (
            <>
              <div style={{ display: 'none' }}>
                <Print
                  ref={componentRef}
                  printData={orderDataById}
                  paymentStatus={getPaymentStatus()}
                  shippingStatus={getOrderStatus(orderDataById.order_status)}
                  trackingNumbers={orderDataById.tracking_number}
                  invoiced={orderDataById.mohawk_order_invoice_file}
                />
              </div>
              <div>
                <Row className="mb-4">
                  <Col sm="4" className="text-center">
                    <img src={logo} alt="logo" style={{ width: '70%' }} />
                  </Col>
                  <Col sm="4">
                    <h6 className="mb-3">Shipping Information:</h6>
                    <div>
                      {orderDataById.ship_first_name}{' '}
                      {orderDataById.ship_last_name}
                    </div>
                    <div>{orderDataById.ship_address_1}</div>
                    <div>{orderDataById.ship_address_2}</div>
                    <div>
                      {orderDataById.ship_city}, {orderDataById.ship_state},{' '}
                      {orderDataById.ship_zip}
                    </div>
                    <div>Email: {orderDataById.ship_e_mail}</div>
                    <div>Phone: {orderDataById.ship_phone}</div>
                    {orderDataById.order_number.split('.')[1] !== 'DS' && (
                      <>
                        <div>Company: {orderDataById.ship_company}</div>
                      </>
                    )}
                  </Col>
                  <Col sm="4">
                    <h6 className="mb-3">Order Details:</h6>
                    <div>
                      Order #: <strong>{orderDataById.order_number} </strong>
                    </div>
                    <div>
                      Order Date:{' '}
                      <strong>
                        {moment(orderDataById.created)
                          .tz('America/New_York')
                          .format('MM/DD/YY hh:mm A z')}
                      </strong>
                    </div>
                    {orderDataById.order_status.toLowerCase() === 'shipped' && (
                      <div>
                        Shipped Date:{' '}
                        <strong>
                          {moment
                            .utc(orderDataById.shipped_date)
                            .format('MM/DD/YY')}
                        </strong>
                      </div>
                    )}
                    <div>
                      Order Type:
                      <strong>
                        {' '}
                        {orderDataById.order_number &&
                        getOrderTypefromCustRef(orderDataById.order_number) ===
                          'DS'
                          ? 'Direct Ship'
                          : getOrderTypefromCustRef(
                              orderDataById.order_number
                            ) === 'DSS'
                          ? 'Direct Ship Store'
                          : orderDataById.order_number &&
                            getOrderTypefromCustRef(
                              orderDataById.order_number
                            ) === 'MKT'
                          ? 'Marketing'
                          : orderDataById.order_number &&
                            getOrderTypefromCustRef(
                              orderDataById.order_number
                            ) === 'DEM'
                          ? 'Demo'
                          : 'Inventory'}
                      </strong>
                    </div>
                    <div>
                      Payment Method:{' '}
                      <strong>
                        {orderDataById.payment_type === 'freepaid'
                          ? 'No Charge'
                          : orderDataById.payment_type === 'stripe'
                          ? 'Credit/Debit Card'
                          : 'Mohawk'}
                      </strong>
                    </div>
                    {orderDataById.mohawk_order_invoice_file !== undefined && (
                      <div className="d-flex align-items-center">
                        Invoiced:{' '}
                        <strong>
                          <a
                            href={getUploadedMohawkPdf(
                              orderDataById.mohawk_order_invoice_file
                            )}
                            target="blank"
                          >
                            {orderDataById.mohawk_order_invoice_file}
                          </a>
                        </strong>
                        {/* <MHKInvoiceModal
                            uploadFile={onUploadMHKInvoiceFile}
                            orderId={orderDataById._id}
                            state={uploading_mhkinvoice_state}
                            btnText="edit..."
                            btnColor="link"
                          /> */}
                      </div>
                    )}
                    Payment Status: <strong>{getPaymentStatus()}</strong>
                    {isAdmin(user.roles) &&
                      (orderDataById.mohawk_order_status === 'approved' ||
                        orderDataById.mohawk_order_status === 'released') && (
                        <div className="d-flex align-items-center">
                          PO (MHK):{' '}
                          <a
                            href={getUploadedPOfile(
                              orderDataById.mohawk_po_file
                            )}
                            target="blank"
                            className="font-weight-bold ml-1"
                          >
                            {orderDataById.mohawk_po_file}
                          </a>
                          {/* <MHKPOUpdateModal 
                              uploadFile={onUpdatePoFile}
                              orderId={orderDataById._id}
                              state={updating_pofile_state} 
                            /> */}
                        </div>
                      )}
                    <div>
                      Shipping Status:{' '}
                      <strong>
                        {getOrderStatus(orderDataById.order_status)}
                      </strong>
                    </div>
                    <div>
                      Account #:
                      <Link
                        to={`/profile/account/${orderDataById.createdBy[0]}`}
                      >
                        <strong>
                          {' '}
                          {orderDataById.mohawk_account_number ||
                            orderDataById.vacuum_account_number}
                        </strong>
                      </Link>
                    </div>
                    {/* <div>Shipment Carrier: <strong>FEDEX</strong></div> */}
                  </Col>
                </Row>
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th className="center">#</th>
                      <th>Item</th>
                      <th className="center">Quantity</th>
                      <th className="right">Unit Cost</th>
                      <th className="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDataById.items &&
                      orderDataById.items.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="center">{index + 1}</td>
                            <td className="left">
                              <strong>{item && item.name}</strong>
                            </td>
                            <td className="center">{item.quantity}</td>
                            <td className="text-left">
                              ${Number(item.price).toFixed(2)}
                            </td>
                            <td className="right">
                              ${Number(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
                <Row>
                  <Col lg="4" sm="5">
                    {getTrackingNumbers()}
                  </Col>
                  <Col lg="4" sm="5" className="ml-auto">
                    <Table className="table-clear">
                      <tbody>
                        <tr>
                          <td className="left">
                            <strong>Subtotal</strong>
                          </td>
                          <td className="right">
                            ${Number(orderDataById.sub_total).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>Tax</strong>
                          </td>
                          <td className="right">$0.00</td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>Discount</strong>
                          </td>
                          <td className="right">
                            ${Number(orderDataById.discount).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>Total</strong>
                          </td>
                          <td className="right">
                            <strong>
                              $
                              {Number(
                                Number(orderDataById.sub_total) -
                                  Number(orderDataById.discount)
                              ).toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    {/* <Link to="#" className="btn btn-success"><i className="fa fa-usd"></i> Proceed to Payment</Link> */}
                  </Col>
                </Row>
              </div>
            </>
          )}
        </CardBody>
        {hasSucceeded(getting_orderbyid_state) && isAdmin(user.roles) && (
          <CardFooter>
            <Row>
              <Col>
                <Button
                  className="btn btn-sm btn-success mr-1"
                  onClick={adminExportFile}
                >
                  <i className="fa fa-save"></i> Download
                </Button>
                {isAdmin(user.roles) && (
                  <PrivacyUploadModal
                    uploadFile={onUploadFile}
                    state={uploading_state}
                    type="xlsx"
                  />
                )}
              </Col>
              <Col>
                <ConfirmationModal
                  state={deleting_state}
                  text="DELETE"
                  size="sm"
                  color="danger"
                  header="Activation"
                  className="float-right mr-1"
                  icon="fa fa-trash"
                  onClickFunc={() => handleDeleteOrder(match.params.id)}
                />
                <OrderEditModal />
              </Col>
            </Row>
          </CardFooter>
        )}
      </Card>
      {isAdmin(user.roles) ? (
        <Notes
          page="order"
          setNotesUpdated={setNotesUpdated}
          orderId={match.params.id}
        />
      ) : null}
    </div>
  );
};

export default OrderDetail;
