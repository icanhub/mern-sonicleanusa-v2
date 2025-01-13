import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import './Register.scss';
import logo from './images/logo.png';
import RegisterSubmitModal from './RegisterSubmitModal';

import { fetchRegister, 
  fetchVacuumRegister,
  registerResetState, } from '../../../reducers/auth';
import RegisterForm from './RegisterForm';
import { hasSucceeded, hasFailed } from '../../../utils/state';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = ({
  register,
  vacuumregister,
  registerState,
  resetState,
  error,
  location,
}) => {
  const [modal, setModal] = useState(false);
  const [vacuumToken, setVacuumToken] = useState(false);

  useEffect(() => {
    if (hasSucceeded(registerState)) {
      toggleModal(true);
    }
    if (hasFailed(registerState)) {
      toggleModal(true);
    }
  }, [registerState]);

  useEffect(() => {
    setVacuumToken(
      location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
        location.pathname.length
      )
    );
    return () => {
      resetState();
    };
  }, []);
  const onSubmit = values => {
    if (vacuumToken === 'register') register(values);
    else vacuumregister(values);
  };

  const toggleModal = val => {
    setModal(val);
    if (!val) {
      resetState();
    }
  };

  return (
    <div className="app Register">
      <ToastContainer />
      <RegisterSubmitModal
        modal={modal}
        state={registerState}
        toggleModal={toggleModal}
      />
      <Container>
        <Row>
          <Col md="12" lg="7" xl="12">
            <Card className="mt-5 mb-5">
              <CardBody className="p-4">
                {vacuumToken === 'register' ? (
                  <>
                    {' '}
                    <div className="text-center">
                      <img src={logo} alt="logo" />
                    </div>
                    <h6 className="mt-3 text-center text-muted font-weight-normal">
                      To become a Soniclean dealer, you will need to register
                      your company by completing and submitting the registration
                      form below. Please note that this program is only
                      available for authorized Mohawk and Karastan retailers.
                      Once you've submitted the registration form, please allow
                      up to 24 to 48 hours for your account to be approved. When
                      your account is approved and activated, you will receive a
                      welcome email with instructions on how to log in to your
                      Soniclean dealer account.
                    </h6>
                  </>
                ) : (
                  <h2 className="mt-3 text-center font-weight-normal">
                    Vacuum Dealer Registration
                  </h2>
                )}
                <RegisterForm
                  submit={onSubmit}
                  state={registerState}
                  id={location.pathname.substring(
                    location.pathname.lastIndexOf('/') + 1,
                    location.pathname.length
                  )}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

//export default Register;
const mapStateToProps = ({ auth }) => {
  const { registerState, error } = auth;
  return { registerState, error };
};

const mapDispatchToProps = dispatch => {
  return {
    register: values => {
      dispatch(fetchRegister(values));
    },
    vacuumregister: values => {
      dispatch(fetchVacuumRegister(values));
    },
    resetState: () => {
      dispatch(registerResetState());
    },
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, null)(Register)
);
