import React from 'react';

import {
  Col,
  Form,
  FormGroup,
  Label,
  Row,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import states from '../../../../_config/states';
import FormInput from '../../../../components/common/FormInput';
import FormPhoneInput from '../../../../components/common/FormPhoneInput';
import FormSelect from '../../../../components/common/FormSelect';

const us_state = states.US;

const storeLocationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, `Firstname has to be at least 2 characters`)
    .required('Firstname is required'),
  lastName: Yup.string()
    .min(2, `Lastname has to be at least 2 characters`)
    .required('Lastname is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required!'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\D*(\d\D*){10}$/, 'Must be a valid number'),
  address1: Yup.string().required('Address1 is required'),
  city: Yup.string().required('City is required'),
  zipcode: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(5, 'Must be exactly 5 digits')
    .max(5, 'Must be exactly 5 digits')
    .required('Zip Code is required'),
});

export default React.forwardRef((props, ref) => (
  <Card className="animated fadeIn mt-5 informationForm">
    <CardHeader className="text-left">
      <i className="icon-note"></i>
      <strong>Customer Shipping Information</strong>
    </CardHeader>
    <CardBody className="text-left" style={{ overflow: 'unset' }}>
      <Formik
        ref={ref}
        initialValues={props.initialValues}
        validationSchema={storeLocationSchema}
        onSubmit={values => props.submitValue(values)}
        enableReinitialize={true}
        render={({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} noValidate name="informationForm">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="firstName">First Name</Label>
                  <Field name="firstName" type={'text'} component={FormInput} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="lastName">Last Name</Label>
                  <Field name="lastName" type={'text'} component={FormInput} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Field name="email" type={'text'} component={FormInput} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="phoneNumber">Phone Number</Label>
                  <Field
                    name="phoneNumber"
                    type={'text'}
                    component={FormPhoneInput}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="address1">Address 1</Label>
              <Field name="address1" type={'text'} component={FormInput} />
            </FormGroup>

            <FormGroup>
              <Label for="address2">Address 2</Label>
              <Field name="address2" type={'text'} component={FormInput} />
            </FormGroup>

            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="city">City</Label>
                  <Field name="city" type={'text'} component={FormInput} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="us_state">State</Label>
                  <Field
                    name="us_state"
                    component={FormSelect}
                    options={us_state}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="zipcode">Zip Code</Label>
                  <Field name="zipcode" type={'text'} component={FormInput} />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        )}
      />
    </CardBody>
  </Card>
));
