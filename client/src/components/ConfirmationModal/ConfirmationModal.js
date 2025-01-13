import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { hasSucceeded, isPending } from '../../utils/state';

const ConfirmationModal = ({
  state,
  text,
  size,
  color,
  onClickFunc,
  className,
  icon = null,
  header,
}) => {
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (hasSucceeded(state)) {
      setModal(false);
    }
  }, [state]);

  return (
    <>
      <Button
        color={color}
        size={size}
        onClick={() => setModal(true)}
        className={`${className} ml-1`}
      >
        {icon && <i className={icon}></i>} {text}
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody className="text-center">
          <Row className="mb-3">
            <Col>
              <h5>Are you Sure?</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                color="primary m-1 w-100"
                onClick={onClickFunc}
                disabled={isPending(state)}
              >
                {isPending(state) ? 'Wait...' : 'Yes'}
              </Button>
            </Col>
            <Col>
              <Button
                color="danger m-1 w-100"
                onClick={() => setModal(false)}
                disabled={isPending(state)}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
