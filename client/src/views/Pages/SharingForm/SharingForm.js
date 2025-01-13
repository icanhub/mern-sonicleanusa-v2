import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Table,
  Button,
  CardFooter,
} from 'reactstrap';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import POInfoModal from '../../../components/POInfoModal';
import { fetchSharedOrderInfo, approveSharedOrderInfo, rejectSharedOrderInfo } from '../../../reducers/OrderHistory';
import { isInitial, isPending, hasSucceeded } from '../../../utils/state';
import LoadingIndicator from '../../../components/common/LoadingIndicator';
import Print from './Print';

import logo from '../../../assets/img/logo.png';

const SharingForm = ({ match }) => {
  const dispatch = useDispatch();
  const componentRef = useRef();

  const get_sharedorder_state = useSelector(
    state => state.orderhistory.get_sharedorder_state
  );

  const update_sharedorder_state = useSelector(
    state => state.orderhistory.update_sharedorder_state
  );

  const reject_sharedorder_state = useSelector(
    state => state.orderhistory.reject_sharedorder_state
  );

  const sharedOrderInfo = useSelector(
    state => state.orderhistory.sharedOrderInfo
  );
  const mohawk_order_status = useSelector(
    state => state.orderhistory.sharedOrderInfo.mohawk_order_status
  );
  useEffect(() => {
    dispatch(fetchSharedOrderInfo(match.params.token));
  }, []);

  const rejectOrder = () => {
    dispatch(rejectSharedOrderInfo(match.params.token, { status: 'rejected' }));
  };

  const approveOrder = values => {
    let data = new FormData();
    data.append('file', values.po_file);
    data.append('po_manager', values.po_manager);
    data.append('po_number', values.po_number);
    data.append('status', 'approved');
    dispatch(approveSharedOrderInfo(match.params.token, data));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="animated fadeIn m-5">
      <Card>
        <CardHeader>
          <Row>
            <Col>
              Invoice{' '}
              <strong>
                #
                {isInitial(get_sharedorder_state) ||
                  isPending(get_sharedorder_state)
                  ? '...'
                  : sharedOrderInfo.order_number}
              </strong>
            </Col>
            <Col>
              {hasSucceeded(get_sharedorder_state) &&
                mohawk_order_status === 'pending' && (
                  <>
                    <ConfirmationModal
                      state={reject_sharedorder_state}
                      text="REJECT"
                      size="sm"
                      color="danger"
                      header="REJECT"
                      className="float-right mr-1"
                      icon="fa fa-close"
                      onClickFunc={() => rejectOrder()}
                    />
                    <POInfoModal onApprove={approveOrder} />
                  </>
                )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {isInitial(get_sharedorder_state) ||
            isPending(get_sharedorder_state) ? (
              <LoadingIndicator />
            ) : (
              <>
                <div style={{ display: 'none' }}>
                  <Print ref={componentRef} printData={sharedOrderInfo} />
                </div>
                <div>
                  <Row className="mb-4">
                    <Col sm="4" className="text-center">
                      <img src={logo} alt="logo" style={{ width: '70%' }} />
                    </Col>
                    <Col sm="4">
                      <h6 className="mb-3">Shipping Information:</h6>
                      <div>
                        {sharedOrderInfo.ship_first_name}{' '}
                        {sharedOrderInfo.ship_last_name}
                      </div>
                      <div>{sharedOrderInfo.ship_address_1}</div>
                      <div>{sharedOrderInfo.ship_address_2}</div>
                      <div>
                        {sharedOrderInfo.ship_city}, {sharedOrderInfo.ship_state},{' '}
                        {sharedOrderInfo.ship_zip}
                      </div>
                      <div>Email: {sharedOrderInfo.ship_e_mail}</div>
                      <div>Phone: {sharedOrderInfo.ship_phone}</div>
                      <div>Company: {sharedOrderInfo.ship_company}</div>
                      <div>Account: {sharedOrderInfo.mohawk_account_number}</div>
                    </Col>
                    <Col sm="4">
                      <h6 className="mb-3">Order Details:</h6>
                      <div>
                        Order #: <strong>{sharedOrderInfo.order_number} </strong>
                      </div>
                      <div>
                        Order Date:{' '}
                        <strong>
                          {' '}
                          {moment(sharedOrderInfo.created)
                            .tz('America/New_York')
                            .format('MM/DD/YY hh:mm A z')}
                        </strong>
                      </div>
                      <div>
                        Order Type:
                      <strong>
                          {' '}
                          {sharedOrderInfo.order_number &&
                            sharedOrderInfo.order_number.split('.')[1] === 'DS'
                            ? 'Direct Ship'
                            : sharedOrderInfo.order_number.split('.')[1] ===
                              'DSS'
                              ? 'Direct Ship Store'
                              : sharedOrderInfo.order_number &&
                                sharedOrderInfo.order_number.split('.')[1] === 'MKT'
                                ? 'Marketing'
                                : sharedOrderInfo.order_number &&
                                  sharedOrderInfo.order_number.split('.')[1] === 'DEM'
                                  ? 'Demo'
                                  : 'Inventory'}
                        </strong>
                      </div>
                      <div>
                        Payment Method: <strong>Mohawk</strong>
                      </div>
                    Payment Status:{' '}
                      <strong>
                        {sharedOrderInfo.mohawk_order_status === 'pending'
                          ? 'Mohawk-Pending'
                          : sharedOrderInfo.mohawk_order_status === 'rejected'
                            ? 'Mohawk-Not Approved'
                            : 'Mohawk-Approved'}
                      </strong>
                      <div>
                        Shipping Status:{' '}
                        <strong>
                          {sharedOrderInfo.mohawk_order_status === 'pending'
                            ? 'Hold-MHK-Pending'
                            : sharedOrderInfo.mohawk_order_status === 'rejected'
                              ? 'Cancelled'
                              : 'Hold-ZNTH-Pending'}
                        </strong>
                      </div>
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
                      {sharedOrderInfo.items &&
                        sharedOrderInfo.items.map((item, index) => {
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
                    <Col lg="4" sm="5"></Col>
                    <Col lg="4" sm="5" className="ml-auto">
                      <Table className="table-clear">
                        <tbody>
                          <tr>
                            <td className="left">
                              <strong>Subtotal</strong>
                            </td>
                            <td className="right">
                              $ {Number(sharedOrderInfo.sub_total).toFixed(2)}
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
                              {Number(sharedOrderInfo.discount).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="left">
                              <strong>Total</strong>
                            </td>
                            <td className="right">
                              <strong>
                                ${' '}
                                {Number(
                                  Number(sharedOrderInfo.sub_total) -
                                  Number(sharedOrderInfo.discount)
                                ).toFixed(2)}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </div>
              </>
            )}
        </CardBody>

        {hasSucceeded(get_sharedorder_state) && (
          <CardFooter>
            <Button
              size="sm"
              color="primary"
              className="float-right mr-1"
              onClick={handlePrint}
            >
              <i className="fa fa-print"></i> Print
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SharingForm;
