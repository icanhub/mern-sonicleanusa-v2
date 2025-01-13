import React, { useState, useLayoutEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Form,
  Label,
} from 'reactstrap';
import { isPending, hasSucceeded } from '../../utils/state';
import { ToastContainer } from 'react-toastify';

import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import FormInput from '../../components/common/FormInput';
import FormFileUpload from '../../components/common/FormFileUpload';
const InvoiceSchema = Yup.object().shape({
    po_number: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required('Tungsten Invoice is required'),
    po_file: Yup.mixed().required('A file is required'),
});

const MHKPOUpdateModal = ({ state, uploadFile, orderId }) => {
  const [modal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
  };

  useLayoutEffect(() => {
    if(hasSucceeded(state)) {
      setModal(false)
    }
    
  }, [state])

  const onSubmit = values => {
    let data = new FormData();
    data.append('file', values.po_file);
    data.append('po_number', values.po_number);
    data.append('orderId', orderId);
    uploadFile(data);
  };

  return (
    <>
      <ToastContainer />
      <Button color="link" size="sm" onClick={openModal}>
        <h6>edit...</h6>
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <ModalHeader>Upload PO File</ModalHeader>
        <Formik
          initialValues={{
            po_number: '',
            po_file: undefined,
          }}
          validationSchema={InvoiceSchema}
          initialErrors
          onSubmit={onSubmit}
        >
          {({ handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit} noValidate name="referralForm">
              <ModalBody>
                <Row>
                  <Col xs={12}>
                    <Label for="po_number" className="text-muted mt-3">
                      PO Number #:
                    </Label>
                    <Field
                      name="po_number"
                      type={'text'}
                      component={FormInput}
                    />
                  </Col>
                  <Col xs={12}>
                    <Label for="po_file" className="text-muted mt-3">
                      Please upload a invoice file for this order
                    </Label>
                    <Field name="po_file" component={FormFileUpload} />
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  type="submit"
                  disabled={!isValid || isPending(state)}
                >
                  {isPending(state) ? 'Wait...' : 'Submit'}
                </Button>
                <Button color="danger" onClick={() => setModal(false)}>
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default MHKPOUpdateModal;
