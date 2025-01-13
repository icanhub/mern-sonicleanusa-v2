import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import * as Contants from '../../_config/constants';
import { notification } from '../../utils/notification';
import { hasSucceeded, hasFailed } from '../../utils/state';

import './SubmitOrderModal.scss';

const SubmitOrderModal = ({ onSubmitOrder, state, onResetOrder }) => {
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (hasSucceeded(state)) {
      notification(
        'success',
        'Your Order has Been Successfully Confirmed',
        'success'
      );
    } else if (hasFailed(state)) {
      notification('Error', 'Sorry, we could not process your order', 'danger');
    }
  }, [state]);

  const toggle = () => {
    setModal(!modal);
  };

  const resetOrder = () => {
    onResetOrder();
  };

  return (
    <div className="submitordermodal">
      <Button
        className="mt-4 font-weight-bold"
        color="success"
        size="lg"
        onClick={toggle}
      >
        Submit Order
      </Button>
      <Modal
        isOpen={modal}
        className={'modal-primary modal-md'}
      >
        <ModalHeader>
          {state === Contants.REQUEST_STATUS.INITIAL
            ? 'Please confirm order submission'
            : state === Contants.REQUEST_STATUS.PENDING
              ? 'Your order is being processed'
              : state === Contants.REQUEST_STATUS.SUCCESS
                ? 'Confirmed'
                : 'Failed'}
        </ModalHeader>
        <ModalBody className="text-center">
          {state === Contants.REQUEST_STATUS.INITIAL ? (
            <div className="mt-5 mb-5 d-flex justify-content-center align-items-center">
              <Button color="success" className="mr-1" onClick={onSubmitOrder}>
                Submit Order!
              </Button>
              <Button color="danger" className="ml-1" onClick={toggle}>
                Cancel
              </Button>
            </div>
          ) : state === Contants.REQUEST_STATUS.PENDING ? (
            <div>
              <h4 className="mt-3">Your Order is Being Processed</h4>
              <h4 className="mt-2">Please wait...</h4>
              <h6 className="mt-2">(Do not refresh this page)</h6>
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          ) : state === Contants.REQUEST_STATUS.SUCCESS ? (
            <div>
              <h4 className="mt-3">Your Order has Been</h4>
              <h4 className="mt-2 mb-3">Successfully Confirmed</h4>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130.2 130.2"
                style={{ width: 100 }}
              >
                <circle
                  className="path circle"
                  fill="none"
                  stroke="#73AF55"
                  strokeWidth="6"
                  stroke-miterlimit="10"
                  cx="65.1"
                  cy="65.1"
                  r="62.1"
                />
                <polyline
                  className="path check"
                  fill="none"
                  stroke="#73AF55"
                  strokeWidth="6"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                  points="100.2,40.2 51.5,88.8 29.8,67.5 "
                />
              </svg>
              <div className="mt-3">
                <Button color="info" className="ml-1" onClick={resetOrder}>
                  View Receipt
                </Button>
              </div>
            </div>
          ) : (
                  <div>
                    <h4 className="mt-3">Sorry, we could not process your order</h4>
                    <h4 className="mt-2 mb-3">Error code: card_declined</h4>
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 130.2 130.2"
                      style={{ width: 100 }}
                    >
                      <circle
                        class="path circle"
                        fill="none"
                        stroke="#D06079"
                        stroke-width="6"
                        stroke-miterlimit="10"
                        cx="65.1"
                        cy="65.1"
                        r="62.1"
                      />
                      <line
                        class="path line"
                        fill="none"
                        stroke="#D06079"
                        stroke-width="6"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        x1="34.4"
                        y1="37.9"
                        x2="95.8"
                        y2="92.3"
                      />
                      <line
                        class="path line"
                        fill="none"
                        stroke="#D06079"
                        stroke-width="6"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        x1="95.8"
                        y1="38"
                        x2="34.4"
                        y2="92.2"
                      />
                    </svg>
                    <div className="mt-3">
                      <Button color="secondary" className="ml-1" onClick={resetOrder}>
                        close
                </Button>
                      <Button color="info" className="ml-1" onClick={resetOrder}>
                        contact soniclean support
                </Button>
                    </div>
                  </div>
                )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SubmitOrderModal;
