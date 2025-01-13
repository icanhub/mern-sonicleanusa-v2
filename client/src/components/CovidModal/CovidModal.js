import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { isAdmin } from '../../_helpers/helper';

const CovidModal = ({ modal, closeCovidModal }) => {
  const user = useSelector(state => state.auth.user);
  return (
    <>
      <Modal isOpen={modal} className={'modal-primary modal-lg'}>
        <ModalHeader toggle={closeCovidModal}>
          {isAdmin(user.roles)
                    ? 'Program Update – June 01 2021'
                    : user.mohawkAccount
                    ? 'Program Update – June 01 2021'
                    : 'Program Update – June 01 2021'}
        </ModalHeader>
        <ModalBody>
          <Row className="mb-3">
            <Col>
              <h5 className="modal-text-color">
                To view the latest program update, click the link below:
              </h5>
              <br />
              <h5 className="modal-text-color">
                <Link to="/programdetails" onClick={closeCovidModal}>
                  {isAdmin(user.roles)
                    ? 'Soniclean | Dealer Programs – June 01 2021'
                    : user.mohawkAccount
                    ? 'Soniclean | Mohawk Program – June 01 2021'
                    : 'Soniclean | Vacuum Program – June 01 2021'}
                </Link>
              </h5>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CovidModal;
