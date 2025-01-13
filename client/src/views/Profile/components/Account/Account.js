import React from 'react';
import { Row, Col, Form, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Formik, Field } from 'formik';
import FormInput from '../../../../components/common/FormInput';
import FormPhoneInput from '../../../../components/common/FormPhoneInput';
import LoadingIndicator from '../../../../components/common/LoadingIndicator';
import * as Yup from 'yup';
import FormSelect from '../../../../components/common/FormSelect';
import { mohawkBrands } from '../../../../_config/constants';
import { updateAccountData } from '../../../../reducers/account';
import { isPending } from '../../../../utils/state';
import { isAdmin, isDealer } from '../../../../_helpers/helper';

const Account = ({ accountData, updateAccount, user, state }) => {
  const accountSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, `First name has to be at least 2 characters`)
      .required('First name is required'),
    lastName: Yup.string()
      .min(1, `Last name has to be at least 1 character`)
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required!'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^\D*(\d\D*){10}$/, 'Must be a valid number'),
    password: Yup.string().min(2, `Password has to be at least 2 characters`),
    mohawkAccount:
      user.roles === 'vacuum-dealer'
        ? null
        : Yup.string()
            .matches(/^[0-9]+$/, 'Must be only digits')
            .min(6, 'Must be exactly 6 digits')
            .max(6, 'Must be exactly 6 digits')
            .required('Mohawk Account is required'),
  });

  const onSubmit = values => {
    if (values.password === '') {
      values.password = accountData.password;
    }
    updateAccount(values, accountData._id);
  };

  return (
    <div className="Account mt-5">
      <Row>
        <Col>
          {isPending(state) ? (
            <LoadingIndicator />
          ) : (
            <Formik
              initialValues={{ ...accountData, password: '' }}
              validationSchema={accountSchema}
              onSubmit={onSubmit}
              render={({ handleSubmit, isValid }) => (
                <Form onSubmit={handleSubmit} noValidate name="simpleForm">
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>First Name*</Label>
                        <Field
                          name="firstName"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Last Name*</Label>
                        <Field
                          name="lastName"
                          type={'text'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Email Address*</Label>
                        <Field
                          name="email"
                          type={'email'}
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Password</Label>
                        <Field
                          name="password"
                          type="text"
                          placeholder="Enter New Password"
                          component={FormInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Work Phone</Label>
                        <Field
                          name="workPhoneNumber"
                          type={'text'}
                          component={FormPhoneInput}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Mobile Phone</Label>
                        <Field
                          name="phoneNumber"
                          type={'text'}
                          component={FormPhoneInput}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {isAdmin(user.roles) && isDealer(accountData.roles) && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="mohawkAccount" className="text-muted">
                            Mohawk Account #
                          </Label>
                          <Field
                            name="mohawkAccount"
                            type={'text'}
                            component={FormInput}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="mohawkBrand">
                            Mohawk or Karastan Dealer?
                          </Label>
                          <Field
                            name="mohawkBrand"
                            component={FormSelect}
                            options={mohawkBrands}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}

                  <hr />
                  <Row className="float-right">
                    <Col>
                      <FormGroup>
                        <Button
                          type="submit"
                          color="success"
                          className="mr-1"
                          disabled={!isValid || isPending(state)}
                        >
                          {isPending(state) ? 'Wait...' : 'Submit'}
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              )}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = ({ account, auth }) => {
  const { accountData, state } = account;
  const { user } = auth;
  return { accountData, state, user };
};

const mapDispatchToProps = dispatch => {
  return {
    updateAccount: (data, id) => {
      dispatch(updateAccountData(data, id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Account);
