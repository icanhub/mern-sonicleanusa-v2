import React from 'react';
import { Button, Modal, ModalFooter, ModalBody, Row, Col } from 'reactstrap';

const LogOutModal = ({ modal, onClickYes, onClickNo }) => {
  return (
    <>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        {/* <ModalHeader toggle={() => setModal(false)}></ModalHeader> */}
        <ModalBody className="text-left">
          <h5>Are you sure you want to logout?</h5>
        </ModalBody>
        <ModalFooter>
          <Row noGutters>
            <Col>
              <Button color="primary" onClick={onClickYes}>
                Yes
              </Button>
            </Col>
            <Col className="ml-2">
              <Button color="danger" onClick={onClickNo}>
                No
              </Button>
            </Col>
          </Row>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LogOutModal;
