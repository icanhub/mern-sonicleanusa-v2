import React from 'react';

import { Container, Row, Col, CardGroup, Card, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ResetPasswordForm from './ResetPasswordForm';

import { fetchResetPassword } from '../../../reducers/auth';
import logo from '../../../assets/img/logo.png';
const ResetPassword = ({ match, resetPassword, resetPasswordState }) => {
  const onSubmit = values => {
    let data = {};
    data.token = match.params.token;
    data.password = values.password;
    resetPassword(data);
  };

  return (
    <div className="app flex-row align-items-center">
      <Container style={{ marginTop: '-150px' }}>
        <Row className="justify-content-center">
          <Col md="6" className="text-center">
            <img src={logo} style={{ width: '60%' }} alt="logo" />
            <Card className="p-4 text-left">
              <CardBody>
                <ResetPasswordForm
                  submit={onSubmit}
                  state={resetPasswordState}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = ({ auth }) => {
  const { resetPasswordState, error } = auth;
  return { resetPasswordState, error };
};

const mapDispatchToProps = dispatch => {
  return {
    resetPassword: data => {
      dispatch(fetchResetPassword(data));
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, null)(ResetPassword)
);
