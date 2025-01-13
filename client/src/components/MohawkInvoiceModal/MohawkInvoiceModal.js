import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
} from 'reactstrap';
import { isPending } from '../../utils/state';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

const MohawkInvoiceModal = ({ onSubmitHandler, orderId, state }) => {
  const [modal, setModal] = useState(false);
  const [date, setDate] = useState(new Date());

  return (
    <>
      <Button
        color="success"
        className="mr-1 float-right"
        size="sm"
        onClick={() => setModal(true)}
      >
        Mark as PAID
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>Input paid date</ModalHeader>
        <ModalBody>
          <Label>Please input order paid date</Label>
          <div>
            <DatePicker
              selected={date}
              onChange={date => setDate(date)}
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => onSubmitHandler({ invoiceDate: date }, orderId)}
          // disabled={selected.length === 0 || selectedFile === null}
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

export default MohawkInvoiceModal;
