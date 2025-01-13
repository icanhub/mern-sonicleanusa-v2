import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import logo from '../../../assets/img/logo.png';

import { Card, CardBody, Col, Container, Row } from 'reactstrap';


import { fetchLogin, resetState } from '../../../reducers/auth';
import { notification } from '../../../utils/notification';
import LoginForm from './LoginForm';

import 'ladda/dist/ladda-themeless.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { hasFailed } from '../../../utils/state';

const Login = ({ userLogin, loginState, error, resetState }) => {
  useEffect(() => {
    if (hasFailed(loginState)) {
      notification('Error', error.message, 'danger');
      resetState();
    }
  }, [loginState]);

  const onSubmit = values => {
    userLogin(values);
  };

  return (
    <div className="app flex-row align-items-center">
      <Container style={{ marginTop: '-150px' }}>
        <Row className="justify-content-center">
          <Col md="6" className="text-center">
            <img src={logo} style={{ width: '60%' }} alt="logo" />
            <Card className="mt-3 p-4 text-left">
              <CardBody>
                <LoginForm submit={onSubmit} state={loginState} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = ({ auth }) => {
  const { isLoggedIn, user, loginState, error } = auth;
  return { isLoggedIn, user, loginState, error };
};

const mapDispatchToProps = dispatch => {
  return {
    userLogin: data => {
      dispatch(fetchLogin(data));
    },
    resetState: () => {
      dispatch(resetState());
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, null)(Login)
);
