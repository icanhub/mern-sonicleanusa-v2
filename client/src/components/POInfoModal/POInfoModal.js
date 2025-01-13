import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Button,
  Form,
  Label,
} from 'reactstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import FormInput from '../../components/common/FormInput';
import FormFileUpload from '../../components/common/FormFileUpload';

const registerSchema = Yup.object().shape({
  po_manager: Yup.string()
    .min(2, `Name has to be at least 2 characters`)
    .required('Name is required'),
  po_number: Yup.string().required('PO number is required'),
  po_file: Yup.mixed().required('A file is required'),
});

const POInfoModal = ({ onApprove }) => {
  const [modal, setModal] = useState(false);

  const onSubmit = values => {
    onApprove(values);
  };

  return (
    <div className="poinfomodal">
      <Button
        color="success"
        className="mr-1 float-right"
        size="sm"
        onClick={() => setModal(true)}
      >
        <i className="fa fa-check"></i> APPROVE
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>Purchase Order Information</ModalHeader>
        <Formik
          initialValues={{
            po_manager: '',
            po_number: '',
            po_file: undefined,
          }}
          validationSchema={registerSchema}
          initialErrors
          onSubmit={onSubmit}
        >
          {({ handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit} noValidate name="referralForm">
              <ModalBody>
                <Row className="mb-3">
                  <Col>
                    <h6 className="text-muted" style={{ lineHeight: '1.3rem' }}>
                      By accepting this order and submitting a purchase order
                      file, Soniclean will release the hold on this order and
                      ship the products to the retailer within 1-2 business
                      days. The retailer will be notified via email that their
                      order has been approved and is in process.
                    </h6>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={12}>
                    <Label for="po_manager" className="text-muted">
                      Authorized by:(Full Name)
                    </Label>
                    <Field
                      name="po_manager"
                      type={'text'}
                      component={FormInput}
                    />
                  </Col>
                  <Col xs={12}>
                    <Label for="po_number" className="text-muted mt-3">
                      Please input the PO number associated with this order.
                    </Label>
                    <Field
                      name="po_number"
                      type={'number'}
                      component={FormInput}
                    />
                  </Col>
                  <Col xs={12}>
                    <Label for="po_number" className="text-muted mt-3">
                      Please upload a PO file for this order
                    </Label>
                    <Field name="po_file" component={FormFileUpload} />
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button color="success" type="submit">
                  Approve and submit
                </Button>
                <Button color="danger" onClick={() => setModal(false)}>
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default POInfoModal;
