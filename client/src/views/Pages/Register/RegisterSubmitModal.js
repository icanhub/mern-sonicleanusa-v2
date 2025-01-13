import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
} from 'reactstrap';
import './RegisterSubmitModal.scss';
import { hasSucceeded, hasFailed } from '../../../utils/state';

const RegisterSubmitModal = ({ modal, toggleModal, state }) => {
  return (
    <div className="">
      <Modal
        isOpen={modal}
        toggle={() => toggleModal(false)}
        className={'modal-primary modal-md'}
      >
        <ModalHeader toggle={() => toggleModal(false)}>
          {hasSucceeded(state) && 'Success'}
          {hasFailed(state) && 'Error'}
        </ModalHeader>
        <ModalBody>
          {
            <Row>
              <Col className="RegisterSubmitModal">
                {hasSucceeded(state) && (
                  <>
                    {window.location.pathname === '/register' ? (
                      <h5>
                        Your Soniclean Dealer registration form has been
                        successfully submitted. Please allow up to 24 to 48
                        hours for account approval. Once your account is
                        approved, you will receive an activation email with your
                        login credentials. If you have any questions, you can
                        contact Soniclean's dealer department. <br />
                      </h5>
                    ) : (
                      <h5>
                        Vacuum Dealer registration successful. Mail sent to
                        dealer to setup their account. <br />
                      </h5>
                    )}
                    <br />
                  </>
                )}
                {hasFailed(state) && (
                  <>
                    {window.location.pathname === '/register' ? (
                      <h5>
                        Unfortunately, we are having trouble processing your
                        dealer registration. For further assistance, please
                        contact Soniclean's dealer support department.
                      </h5>
                    ) : (
                      <h5>
                        Vacuum Dealer registration failed. This email might
                        already have been registered or you may have some
                        network issues.
                        <br />
                      </h5>
                    )}
                  </>
                )}
                <h5 className="font-weight-bold mt-4">Phone: (954) 228-9100</h5>
                <h5 className="font-weight-bold mt-2">
                  Email: dealerinfo@sonicleanusa.com
                </h5>
              </Col>
            </Row>
          }
        </ModalBody>
        <ModalFooter className="text-center">
          {hasSucceeded(state) && (
            <a href="/">
              {' '}
              <Button
                color="success"
                onClick={() => toggleModal(false)}
                className="mr-auto ml-auto"
              >
                Return
              </Button>
            </a>
          )}
          {hasFailed(state) && (
            <Button
              color="danger"
              onClick={() => toggleModal(false)}
              className="mr-auto ml-auto"
            >
              Close
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
};

RegisterSubmitModal.propTypes = {};

export default RegisterSubmitModal;
