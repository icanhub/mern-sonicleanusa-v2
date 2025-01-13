import React from 'react';
import {
  Button,
  Col,
  Form,
  Row,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormFeedback,
  Input,
} from 'reactstrap';
import { Formik } from 'formik';
import { Link } from 'react-router-dom';
import LaddaButton, { EXPAND_RIGHT, L } from 'react-ladda';

import * as Yup from 'yup';

import 'ladda/dist/ladda-themeless.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { hasSucceeded, isPending } from '../../../utils/state';

const resetpasswordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match'
  ),
});

const ResetPasswordForm = ({ submit, state }) => {
  const onSubmit = (values, { setSubmitting, setErrors }) => {
    submit(values);
  };

  return (
    <Formik
      initialValues={{
        passwordConfirmation: '',
        password: '',
      }}
      validationSchema={resetpasswordSchema}
      enableReinitialize
      onSubmit={onSubmit}
      render={({
        handleSubmit,
        isValid,
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
      }) => (
        <Form onSubmit={handleSubmit} noValidate name="LoginForm">
          <h1>Create Password</h1>
          <p className="text-muted">
            Please set your password to verify your account.
          </p>
          <InputGroup className="mb-3">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="icon-lock" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={values.password}
              name="password"
              // valid={!errors.password}
              invalid={touched.password && !!errors.password}
              required
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormFeedback>{errors.password}</FormFeedback>
          </InputGroup>
          <InputGroup className="mb-4">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="icon-lock" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="password"
              placeholder="Confirm Password"
              autoComplete="current-password"
              value={values.passwordConfirmation}
              name="passwordConfirmation"
              // valid={!errors.passwordConfirmation}
              invalid={
                touched.passwordConfirmation && !!errors.passwordConfirmation
              }
              required
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormFeedback>{errors.passwordConfirmation}</FormFeedback>
          </InputGroup>
          <Row>
            <Col xs="6">
              {hasSucceeded(state) ? (
                <Link to="/login">
                  {' '}
                  <Button color="primary">Back to Login</Button>{' '}
                </Link>
              ) : (
                <LaddaButton
                  type="submit"
                  className="btn btn-primary btn-ladda"
                  loading={isPending(state)}
                  data-color="primary"
                  data-size={L}
                  data-style={EXPAND_RIGHT}
                  disabled={!isValid}
                >
                  Submit
                </LaddaButton>
              )}
            </Col>
          </Row>
        </Form>
      )}
    />
  );
};

export default ResetPasswordForm;
