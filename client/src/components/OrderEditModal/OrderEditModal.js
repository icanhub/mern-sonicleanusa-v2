import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { FormFeedback } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import DatePicker from '../../components/common/DatePickerField';
import FormFileUpload from '../../components/common/FormFileUpload';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import states from '../../_config/states';
import {
  OrderStatus,
  PaymentTypes,
  MKTKarastanProducts,
  DemoProducts,
  DirectShipKarastanProducts,
  InventoryKarastanProducts,
  mohawkPaymentStatus,
} from '../../_config/constants';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import { isPending, hasSucceeded, hasFailed } from '../../utils/state';
import { getOrderTypefromCustRef } from '../../_helpers/helper';
import {
  editOrderApi,
  uploadMHKInvoicFileApi,
  updatePOFileApi,
} from '../../reducers/OrderHistory';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const us_state = states.US;

const orderEditSchema = Yup.object().shape({
  mohawk_account_number: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(6, 'Must be exactly 6 digits')
    .max(6, 'Must be exactly 6 digits')
    .required('Mohawk Account is required'),
  dealer_email: Yup.string()
    .email('Invalid email address')
    .required('Email is required!'),
  ship_first_name: Yup.string()
    .min(2, `First name has to be at least 2 characters`)
    .required('First name is required'),
  ship_last_name: Yup.string()
    .min(2, `Last name has to be at least 2 characters`)
    .required('Last name is required'),
  ship_e_mail: Yup.string()
    .email('Invalid email address')
    .required('Ship email is required!'),
  ship_address_1: Yup.string().required('Address1 is required'),
  ship_city: Yup.string().required('City is required'),
  ship_zip: Yup.string()
    .length(5, `Zip Code has to be at 5 characters`)
    .required('Zip Code is required'),
  shipped_date: Yup.string().when('order_status', {
    is: 'shipped',
    then: Yup.string()
      .required('shipped date is required.')
      .nullable(),
    otherwise: Yup.string()
      .notRequired()
      .nullable(),
  }),
  // mohawk_order_paid_date: Yup.string().when('mohawk_payment_status', {
  //   is: 'paid',
  //   then: Yup.string().required('Paid date is required.').nullable(),
  //   otherwise: Yup.string().notRequired().nullable()
  // }),
  // mohawk_po_manager: Yup.string().required('Authorizer is required'),
  // mohawk_po_number: Yup.string().matches(/^[0-9]+$/, "Must be only digits").required('PO number is required'),
  // mohawk_order_invoice_number: Yup.string().matches(/^[0-9]+$/, "Must be only digits").required('Tungsten Invoice is required'),
  // mohawk_po_file: Yup.mixed().required('A file is required'),
});

const OrderEditModal = ({ id }) => {
  const [modal, setModal] = useState(false);

  const [errorMessage, setError] = useState('');

  const dispatch = useDispatch();

  const editing_state = useSelector(state => state.orderhistory.editing_state);
  const orderDataById = useSelector(state => state.orderhistory.orderDataById);
  const [p_items, setPItems] = useState(orderDataById.items);
  const [p_changed, setPChanged] = useState(false);
  const [subTotal, setSubTotal] = useState(
    Number(orderDataById.sub_total).toFixed(2)
  );

  useEffect(() => {
    if (hasSucceeded(editing_state)) {
      setModal(false);
    } else if (hasFailed(editing_state)) {
      setError('Oops! Please try agian!');
    }
  }, [editing_state]);

  useEffect(() => {
    setPChanged(true);
  }, [p_items]);

  const onSubmit = async values => {
    // values.items = p_items;

    let data = new FormData();
    data.append('mohawk_account_number', values.mohawk_account_number);
    data.append('dealer_email', values.dealer_email);
    data.append('ship_first_name', values.ship_first_name);
    data.append('ship_last_name', values.ship_last_name);
    data.append('ship_company', values.ship_company);
    data.append('ship_phone', values.ship_phone);
    data.append('ship_e_mail', values.ship_e_mail);
    data.append('ship_address_1', values.ship_address_1);
    data.append('ship_address_2', values.ship_address_2);
    data.append('ship_city', values.ship_city);
    data.append('ship_state', values.ship_state);
    data.append('ship_zip', values.ship_zip);
    data.append('order_status', values.order_status);
    data.append('tracking_number', values.tracking_number);
    data.append('payment_type', values.payment_type);
    data.append('sub_total', values.sub_total);
    data.append('discount', values.discount);
    data.append('total', values.total);
    data.append('shipped_date', values.shipped_date);
    data.append('mohawk_po_number', values.mohawk_po_number);
    data.append('mohawk_po_manager', values.mohawk_po_manager);
    data.append(
      'mohawk_order_invoice_number',
      values.mohawk_order_invoice_number
    );
    data.append('mohawk_order_paid_date', values.mohawk_order_paid_date);
    data.append('mohawk_payment_status', values.mohawk_payment_status);
    data.append('mohawk_po_file', values.mohawk_po_file);
    data.append('mohawk_order_invoice_file', values.mohawk_order_invoice_file);
    data.append('items', JSON.stringify(p_items));

    dispatch(editOrderApi(orderDataById._id, data));
  };

  const handleProductsChange = (newValue, oldValue, row, col) => {
    let new_product = [];
    let new_item = {};

    // let PorductsList = getOrderTypefromCustRef(orderDataById.cust_ref) === 'INV' &&
    let ProductsList;
    switch (getOrderTypefromCustRef(orderDataById.order_number)) {
      case 'INV':
        ProductsList = InventoryKarastanProducts;
        break;
      case 'DEM':
        ProductsList = DemoProducts;
        break;
      case 'MKT':
        ProductsList = MKTKarastanProducts;
        break;
      case 'DSS':
        ProductsList = DirectShipKarastanProducts;
        break;
      case 'DS':
        ProductsList = DirectShipKarastanProducts;
        break;
      default:
        break;
    }

    new_product = ProductsList.filter(item => item._id === row.item);
    new_item['item'] = new_product[0]._id;
    new_item['name'] = new_product[0].name;
    new_item['model'] = new_product[0].description;
    new_item['quantity'] = Number(row.quantity);
    new_item['price'] = Number(row.price).toFixed(2);
    new_item['imageurl'] = new_product[0].imageurl;
    new_item['discount'] = 0;
    new_item['sub_total'] = row.price * row.quantity;

    let new_items = orderDataById.items.map(item => {
      if (item.name === row.name) {
        return new_item;
      } else {
        return item;
      }
    });
    setSubTotal(
      new_items
        .map(item => item.sub_total)
        .reduce((acc, sub_total) => sub_total + acc)
    );
    setPItems(new_items);
  };

  const dateFormatter = date => {
    return moment(date)
      .tz('America/New_York')
      .format('MM/DD/YY hh:mm A z');
  };

  const columns = [
    {
      dataField: 'any',
      text: 'No',
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '5%' };
      },
    },

    {
      dataField: 'item',
      text: 'Item',
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '20%' };
      },
      editor: {
        type: Type.SELECT,
        getOptions: () => {
          if (getOrderTypefromCustRef(orderDataById.order_number) === 'MKT') {
            return MKTKarastanProducts.map(item => {
              return { value: item._id, label: item._id };
            });
          } else if (
            getOrderTypefromCustRef(orderDataById.order_number) === 'DEM'
          ) {
            return DemoProducts.map(item => {
              return { value: item._id, label: item._id };
            });
          } else if (
            getOrderTypefromCustRef(orderDataById.order_number) === 'DS' ||
            getOrderTypefromCustRef(orderDataById.order_number) === 'DSS'
          ) {
            return DirectShipKarastanProducts.map(item => {
              return { value: item._id, label: item._id };
            });
          } else if (
            getOrderTypefromCustRef(orderDataById.order_number) === 'INV'
          ) {
            return InventoryKarastanProducts.map(item => {
              return { value: item._id, label: item._id };
            });
          }
        },
      },
    },
    {
      dataField: 'quantity',
      text: 'Quantity',
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '5%' };
      },
      sort: true,
    },
    {
      dataField: 'price',
      text: 'Price',
      align: 'left',
      headerAlign: 'left',
      formatter: (cell, row) => {
        return `$ ${Number(cell).toFixed(2)}`;
      },
      headerStyle: () => {
        return { width: '20%' };
      },
      sort: true,
      editable: true,
    },
    {
      dataField: 'sub_total',
      text: 'Total',
      formatter: (cell, row) => {
        if (row.payment_type === 'No Charge') {
          return `$ 0.00`;
        } else {
          return `$ ${Number(Number(row.price * row.quantity)).toFixed(2)}`;
        }
      },
      align: 'left',
      headerAlign: 'left',
      headerStyle: () => {
        return { width: '20%' };
      },
      sort: true,
      editable: false,
    },
  ];

  return (
    <>
      <Button
        color="success"
        className="mr-1 float-right"
        size="sm"
        onClick={() => setModal(true)}
      >
        <i className="fa fa-edit"></i> EDIT
      </Button>

      <Modal isOpen={modal} className={'modal-primary modal-lg'}>
        <Formik
          initialValues={{
            mohawk_account_number: orderDataById.mohawk_account_number,
            dealer_email: orderDataById.dealer_email,
            ship_first_name: orderDataById.ship_first_name,
            ship_last_name: orderDataById.ship_last_name,
            ship_company: orderDataById.ship_company,
            ship_phone: orderDataById.ship_phone,
            ship_e_mail: orderDataById.ship_e_mail,
            ship_address_1: orderDataById.ship_address_1,
            ship_address_2: orderDataById.ship_address_2
              ? orderDataById.ship_address_2
              : '',
            ship_city: orderDataById.ship_city,
            ship_state: orderDataById.ship_state,
            ship_zip: orderDataById.ship_zip,
            order_status: orderDataById.order_status.toLowerCase(),
            tracking_number: orderDataById.tracking_number,
            payment_type: orderDataById.payment_type,
            sub_total: subTotal,
            discount: orderDataById.discount
              ? orderDataById.discount.toFixed(2)
              : 0,
            total: subTotal - orderDataById.discount,
            shipped_date: orderDataById.shipped_date,
            mohawk_po_number: orderDataById.mohawk_po_number,
            mohawk_po_manager: orderDataById.mohawk_po_manager,
            mohawk_order_invoice_number:
              orderDataById.mohawk_order_invoice_number,
            mohawk_order_paid_date: orderDataById.mohawk_order_paid_date,
            mohawk_payment_status:
              orderDataById.mohawk_order_paid_date === undefined
                ? 'unpaid'
                : 'paid',
            mohawk_po_file: orderDataById.mohawk_po_file,
            mohawk_order_invoice_file: orderDataById.mohawk_order_invoice_file,
          }}
          validationSchema={orderEditSchema}
          onSubmit={onSubmit}
          enableReinitialize={false}
          render={({
            handleSubmit,
            isValid,
            values,
            setFieldValue,
            errors,
            handleBlur,
            touched,
          }) => {
            return (
              <Form onSubmit={handleSubmit} noValidate name="orderEditForm">
                <ModalHeader>
                  Edit Order(#{orderDataById.order_number})
                </ModalHeader>
                <ModalBody>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="mohawk_account_number">Account</Label>
                        <Field
                          name="mohawk_account_number"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="dealer_email">Email</Label>
                        <Field
                          name="dealer_email"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="order_status">Order Status</Label>
                        <Field
                          name="order_status"
                          component={FormSelect}
                          options={OrderStatus}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="payment_type">Payment Type</Label>
                        <Field
                          name="payment_type"
                          component={FormSelect}
                          options={PaymentTypes}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {values.order_status === 'shipped' && (
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="tracking_number">Tracking number</Label>
                          <Field
                            name="tracking_number"
                            type={'text'}
                            component={FormInput}
                          />
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="tracking_number">Shipped date</Label>
                          <div>
                            <DatePicker
                              name="shipped_date"
                              value={values.shipped_date}
                              onChange={setFieldValue}
                              valid={!errors.shipped_date}
                              invalid={
                                touched.shipped_date && !!errors.shipped_date
                              }
                              required
                              onBlur={handleBlur}
                              className={
                                !errors.shipped_date
                                  ? 'form-control'
                                  : 'is-invalid form-control'
                              }
                            />
                            <FormFeedback style={{ display: 'block' }}>
                              {errors.shipped_date}
                            </FormFeedback>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="ship_first_name">First Name</Label>
                        <Field
                          name="ship_first_name"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="ship_last_name">Last Name</Label>
                        <Field
                          name="ship_last_name"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="ship_company">Ship Company</Label>
                        <Field
                          name="ship_company"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="ship_phone">Ship Phone Number</Label>
                        <Field
                          name="ship_phone"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="ship_e_mail">Ship Email</Label>
                        <Field
                          name="ship_e_mail"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="ship_address_1">Address 1</Label>
                        <Field
                          name="ship_address_1"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="ship_address_2">Address 2</Label>
                        <Field
                          name="ship_address_2"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="ship_city">City</Label>
                        <Field
                          name="ship_city"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="ship_state">State</Label>
                        <Field
                          name="ship_state"
                          component={FormSelect}
                          options={us_state}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="ship_zip">Zip Code</Label>
                        <Field
                          name="ship_zip"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {values.payment_type === 'mohawk' && (
                    <Row>
                      <Col xs={12}>Invoice & PO Files</Col>
                      <Col className="ml-2">
                        <FormGroup>
                          <Label for="mohawk_po_file">Upload Mohawk PO</Label>
                          <Field
                            name="mohawk_po_file"
                            component={FormFileUpload}
                          />
                        </FormGroup>
                        {values.mohawk_po_file && (
                          <>
                            <FormGroup>
                              <Label for="mohawk_po_number">Mohawk PO#</Label>
                              <Field
                                name="mohawk_po_number"
                                component={FormInput}
                              />
                            </FormGroup>
                            <FormGroup>
                              <Label for="mohawk_po_manager">
                                Authorizer(Mohawk)
                              </Label>
                              <Field
                                name="mohawk_po_manager"
                                component={FormInput}
                              />
                            </FormGroup>
                          </>
                        )}
                      </Col>
                      <Col className="ml-2">
                        <FormGroup>
                          <Label for="mohawk_order_invoice_file">
                            Upload Tungsten Invoice
                          </Label>
                          <Field
                            name="mohawk_order_invoice_file"
                            component={FormFileUpload}
                          />
                        </FormGroup>
                        {values.mohawk_order_invoice_file && (
                          <>
                            <FormGroup>
                              <Label for="mohawk_order_invoice_number">
                                Invoice #
                              </Label>
                              <Field
                                name="mohawk_order_invoice_number"
                                component={FormInput}
                              />
                            </FormGroup>
                            <FormGroup>
                              <Label for="mohawk_payment_status">
                                Mohawk Payment Status
                              </Label>
                              <Field
                                name="mohawk_payment_status"
                                component={FormSelect}
                                options={mohawkPaymentStatus}
                              />
                            </FormGroup>
                            {values.mohawk_payment_status === 'paid' && (
                              <FormGroup>
                                <Label for="mohawk_po_manager">
                                  Invoice Paid Date
                                </Label>
                                <div>
                                  <DatePicker
                                    name="mohawk_order_paid_date"
                                    value={values.mohawk_order_paid_date}
                                    onChange={setFieldValue}
                                    valid={!errors.mohawk_order_paid_date}
                                    invalid={
                                      touched.mohawk_order_paid_date &&
                                      !!errors.mohawk_order_paid_date
                                    }
                                    required
                                    onBlur={handleBlur}
                                    className={
                                      !errors.mohawk_order_paid_date
                                        ? 'form-control'
                                        : 'is-invalid form-control'
                                    }
                                  />
                                  <FormFeedback style={{ display: 'block' }}>
                                    {errors.mohawk_order_paid_date}
                                  </FormFeedback>
                                </div>
                              </FormGroup>
                            )}
                          </>
                        )}
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col>
                      {hasFailed(editing_state) && (
                        <h6 className="text-danger">{errorMessage}</h6>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Label for="items">Products</Label>
                      <BootstrapTable
                        bootstrap4={true}
                        keyField="name"
                        data={orderDataById.items}
                        columns={columns}
                        cellEdit={cellEditFactory({
                          mode: 'click',
                          blurToSave: true,
                          afterSaveCell: (oldValue, newValue, row, column) => {
                            handleProductsChange(
                              oldValue,
                              newValue,
                              row,
                              column
                            );
                            row.sub_total = row.price * row.quantity;
                          },
                        })}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="sub_total">Sub Total</Label>
                        <Field
                          name="sub_total"
                          type={'number'}
                          disabled
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for="discount">Discount</Label>
                        <Field
                          name="discount"
                          type={'number'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <Label for="total">Total</Label>
                      <Field
                        name="total"
                        type={'number'}
                        value={Number(subTotal - values.discount).toFixed(2)}
                        component={FormInput}
                        disabled
                      />
                    </Col>
                  </Row>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    type="submit"
                    disabled={isPending(editing_state)}
                  >
                    {isPending(editing_state) ? 'Wait...' : 'Submit'}
                  </Button>
                  <Button
                    color="danger"
                    onClick={() => setModal(false)}
                    disabled={isPending(editing_state)}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </Form>
            );
          }}
        />
      </Modal>
    </>
  );
};

export default withRouter(OrderEditModal);
