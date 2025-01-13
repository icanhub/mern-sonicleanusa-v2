import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from 'reactstrap';

import { isPending } from '../../utils/state';

const MKTPaidModal = ({ state, shippingMKTOrder }) => {
  const [modal, setModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const onSubmitHandler = () => {
    shippingMKTOrder(trackingNumber);
  };

  const openModal = () => {
    setModal(true);
  };

  return (
    <>
      <Button type="button" size="sm" color="success" onClick={openModal}>
        <span className="text-white">Mark as Shipped</span>
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>Mark as Shipped</ModalHeader>
        <ModalBody>
          <h6>Add tracking numbers separated by a comma.</h6>
          <Input
            className="mt-1"
            type="text"
            name="trackingnumber"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="ex. 12345678944, 123456789"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={onSubmitHandler}
            disabled={trackingNumber.length === 0}
          >
            {isPending(state) ? 'Wait...' : 'Submit'}
          </Button>
          <Button
            color="danger"
            disabled={isPending(state)}
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withRouter(MKTPaidModal);
