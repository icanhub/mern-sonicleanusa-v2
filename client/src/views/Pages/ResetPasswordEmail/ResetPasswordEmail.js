import React, { useEffect } from 'react';
import { Container, Row, Col, CardGroup, Card, CardBody } from 'reactstrap';
import ResetPasswordEmailForm from './ResetPasswordEmailForm';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchResetPasswordEmail, resetPasswordEmailState } from '../../../reducers/auth';
import { ToastContainer, toast } from 'react-toastify';
import { hasSucceeded, hasFailed } from '../../../utils/state';
import logo from '../../../assets/img/logo.png';
const ResetPasswordEmail = ({
  resetPasswordEmail,
  resetPasswordState,
  reset,
  error,
}) => {
  // useEffect(() => {
  //   return () => {
  //     reset();
  //   };
  // }, []);

  useEffect(() => {
    if (hasFailed(resetPasswordState)) {
      toast.error(error.message);
    } else if (hasSucceeded(resetPasswordState)) {
      toast.success(
        'If your email matches our records, you will receive a password reset link'
      );
    }
  }, [resetPasswordState]);

  const onSubmit = values => {
    resetPasswordEmail(values);
  };
  return (
    <div className="app flex-row align-items-center">
      <ToastContainer position={toast.POSITION.TOP_CENTER} />
      <Container style={{ marginTop: '-150px' }}>
        <Row className="justify-content-center">
          <Col md="6" className="text-center">
            <img src={logo} style={{ width: '60%' }} alt="logo" />
            <CardGroup>
              <Card className="mt-3 p-4 text-left">
                <CardBody>
                  <ResetPasswordEmailForm
                    submit={onSubmit}
                    state={resetPasswordState}
                  />
                </CardBody>
              </Card>
            </CardGroup>
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
    resetPasswordEmail: data => {
      dispatch(fetchResetPasswordEmail(data));
    },
    reset: () => {
      dispatch(resetPasswordEmailState());
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, null)(ResetPasswordEmail)
);
