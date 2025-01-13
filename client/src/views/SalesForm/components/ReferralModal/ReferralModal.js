import React, { Component } from 'react';
import {
  Col,
  Form,
  Row,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import { Formik } from 'formik';
import 'react-select/dist/react-select.min.css';
import * as Yup from 'yup';

import './ReferralModal.scss';

const validationSchema = function(values) {
  return Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required!'),
    firstName: Yup.string()
      .min(2, `First name has to be at least 2 characters`)
      .required('First name is required'),
    lastName: Yup.string()
      .min(1, `Last name has to be at least 1 character`)
      .required('Last name is required'),
  });
};

const validate = getValidationSchema => {
  return values => {
    const validationSchema = getValidationSchema(values);
    try {
      validationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (error) {
      return getErrorsFromValidationError(error);
    }
  };
};

const getErrorsFromValidationError = validationError => {
  const FIRST_ERROR = 0;
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    };
  }, {});
};

const initialValues = {
  email: '',
  firstName: '',
  lastName: '',
};

class ReferralModal extends Component {
  constructor(props) {
    super(props);
    this.touchAll = this.touchAll.bind(this);
    this.state = {
      submitSuccess: false,
      email: '',
      firstName: '',
      lastname: '',
    };
  }

  findFirstError(formName, hasError) {
    const form = document.forms[formName];
    for (let i = 0; i < form.length; i++) {
      if (hasError(form[i].name)) {
        form[i].focus();
        break;
      }
    }
  }

  validateForm(errors) {
    this.findFirstError('referralForm', fieldName => {
      return Boolean(errors[fieldName]);
    });
  }

  touchAll(setTouched, errors) {
    setTouched({
      email: true,
    });
    this.validateForm(errors);
  }

  onSubmit = (values, { setSubmitting, setErrors }) => {
    this.setState({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    });
    setTimeout(() => {
      this.setState({ submitSuccess: true });
      setSubmitting(false);
    }, 5000);
  };

  render() {
    return (
      <div className="animated fadeIn mt-3 ReferralModal">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={validate(validationSchema)}
          onSubmit={this.onSubmit}
          render={({
            values,
            errors,
            touched,
            status,
            dirty,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            isValid,
            handleReset,
            setTouched,
          }) => (
            <Modal
              isOpen={this.props.toogle}
              className={'modal-primary ReferralModal modal-md'}
            >
              <Form onSubmit={handleSubmit} noValidate name="referralForm">
                <ModalHeader toggle={this.toggleModal}>
                  Send Customer Referral Link
                </ModalHeader>
                <ModalBody>
                  {!this.state.submitSuccess && !isSubmitting ? (
                    <Row>
                      <Col>
                        <Row>
                          <Col>
                            <h6 className="font-weight-normal">
                              Soniclean will email your customer a link to where
                              they can purchase a Soniclean Soft Carpet vacuum
                              for 15% off the retail MAP price ($53.99 off). If
                              your customer completes their purchase, your
                              account will be credited 1 Soniclean referral
                              point.
                              <br />
                              <br />
                              1 Soniclean Referral = $50.00
                              <br />
                              <br />
                              We will disburse referral commissions to your
                              company every month. Referral commissions will be
                              paid via a check from Soniclean. Complete the form
                              below to send a referral link to your customer.
                            </h6>
                          </Col>
                        </Row>
                        <Row className="mt-3">
                          <Col md={6}>
                            <FormGroup>
                              <Label for="firstName">Customer First Name</Label>
                              <div>
                                <Input
                                  type="firstName"
                                  name="firstName"
                                  id="firstName"
                                  autoComplete="firstName"
                                  valid={!errors.firstName}
                                  invalid={
                                    touched.firstName && !!errors.firstName
                                  }
                                  required
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.firstName}
                                />
                                <FormFeedback>{errors.firstName}</FormFeedback>
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="lastName">Customer Last Name</Label>
                              <div>
                                <Input
                                  type="lastName"
                                  name="lastName"
                                  id="lastName"
                                  autoComplete="lastName"
                                  valid={!errors.lastName}
                                  invalid={
                                    touched.lastName && !!errors.lastName
                                  }
                                  required
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.lastName}
                                />
                                <FormFeedback>{errors.lastName}</FormFeedback>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={12} className="mt-2">
                            <FormGroup>
                              <Label for="email">Customer Email</Label>
                              <div>
                                <Input
                                  type="email"
                                  name="email"
                                  id="email"
                                  autoComplete="email"
                                  valid={!errors.email}
                                  invalid={touched.email && !!errors.email}
                                  required
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.email}
                                />
                                <FormFeedback>{errors.email}</FormFeedback>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ) : !this.state.submitSuccess && isSubmitting ? (
                    <Row>
                      <Col className="text-center">
                        <h4 className="text-muted font-wegith-bold">
                          Please wait...
                        </h4>
                        <h6 className="text-muted font-weight-bold">
                          (Do not close or refresh this page)
                        </h6>
                        <h6 className="text-muted font-weight-bold mt-3">
                          {this.state.firstName} {this.state.lastName}
                        </h6>
                        <h6 className="text-muted font-weight-bold">
                          {this.state.email}
                        </h6>
                        <div class="circle-loader mt-3">
                          <div class="checkmark draw"></div>
                        </div>
                      </Col>
                    </Row>
                  ) : this.state.submitSuccess && !isSubmitting ? (
                    <Row>
                      <Col className="text-center">
                        <h4 className="text-muted font-wegith-bold">
                          Referral Link Sent Successfully!
                        </h4>
                        <h6 className="text-muted font-weight-bold mt-3">
                          {this.state.firstName} {this.state.lastName}
                        </h6>
                        <h6 className="text-muted font-weight-bold">
                          {this.state.email}
                        </h6>
                        <div class="circle-loader load-complete mt-3">
                          <div
                            class="checkmark draw "
                            style={{ display: 'block' }}
                          ></div>
                        </div>
                      </Col>
                    </Row>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  {!this.state.submitSuccess && !isSubmitting ? (
                    <>
                      <Button color="primary" type="submit" disabled={!isValid}>
                        {'Submit'}
                      </Button>
                      <Button color="danger" onClick={this.props.closeModal}>
                        Cancel
                      </Button>
                    </>
                  ) : !this.state.submitSuccess && isSubmitting ? (
                    <>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={isSubmitting || !isValid}
                      >
                        {'Wait...'}
                      </Button>
                    </>
                  ) : this.state.submitSuccess && !isSubmitting ? (
                    <>
                      <Button
                        color="danger"
                        onClick={() => {
                          this.props.closeModal();
                          handleReset();
                        }}
                      >
                        Done
                      </Button>
                    </>
                  ) : null}
                </ModalFooter>
              </Form>
            </Modal>
          )}
        />
      </div>
    );
  }
}

export default ReferralModal;
