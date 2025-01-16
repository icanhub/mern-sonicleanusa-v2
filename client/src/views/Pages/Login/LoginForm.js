import React from "react";
import { Link } from "react-router-dom";
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
} from "reactstrap";
import { Formik } from "formik";
import LaddaButton, { EXPAND_RIGHT, L } from "react-ladda";
import * as Yup from "yup";
import { isPending } from "../../../utils/state";

import "ladda/dist/ladda-themeless.min.css";
import "react-toastify/dist/ReactToastify.css";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required!"),
  password: Yup.string().required("Password is required"),
});

const LoginForm = ({ submit, state }) => {
  const onSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await submit(values);
    } catch (error) {
      setErrors({ submit: "An error occured" });
    } finally {
      setSubmitting(false);
    }
  };

  const isInitialValid = (props) => {
    if (!props.validationSchema) return true;
    return props.validationSchema.isValidSync(props.initialValues);
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      validationSchema={loginSchema}
      onSubmit={onSubmit}
      isInitialValid={isInitialValid}
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
          <h1>Sign in</h1>
          <p className="text-muted">Please enter your login credentials</p>
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
          <InputGroup className="mb-4">
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
          <Row>
            <Col xs="4">
              <LaddaButton
                type="submit"
                className="btn btn-primary btn-ladda"
                loading={isPending(state)}
                data-color="primary"
                data-size={L}
                data-style={EXPAND_RIGHT}
                disabled={!isValid}
              >
                Login
              </LaddaButton>
            </Col>
            <Col xs="4" className="text-right">
              <Link to="/resetpassword">
                <Button
                  type="button"
                  color="link"
                  className="px-0"
                  disabled={isPending(state)}
                  to="/resetpassword"
                >
                  Reset Password
                </Button>
              </Link>
            </Col>
            <Col xs="4" className="text-right">
              <Link to="/register">
                <Button
                  type="button"
                  color="link"
                  className="px-0"
                  disabled={isPending(state)}
                  to="/resetpassword"
                >
                  Register
                </Button>
              </Link>
            </Col>
          </Row>
        </Form>
      )}
    />
  );
};

export default LoginForm;
