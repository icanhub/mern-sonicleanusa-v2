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

const resetpasswordEmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required!'),
});

const ResetPasswordEmailForm = ({ submit, state }) => {
  const onSubmit = (values, { setSubmitting, setErrors }) => {
    submit(values);
  };

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={resetpasswordEmailSchema}
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
          <h1>Reset Password</h1>
          <p className="text-muted">
            Please input your email address and if it matches our records, we’ll
            email you a link where you can reset your password.
          </p>
          <InputGroup className="mb-3">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="icon-user" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="text"
              placeholder="Email"
              autoComplete="email"
              name="email"
              value={values.email}
              // valid={!errors.email}
              invalid={touched.email && !!errors.email}
              required
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FormFeedback>{errors.email}</FormFeedback>
          </InputGroup>

          <Row className="mt-4">
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

export default ResetPasswordEmailForm;
