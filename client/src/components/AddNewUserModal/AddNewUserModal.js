import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import {
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import { isPending, hasSucceeded, hasFailed } from '../../utils/state';
import './AddNewUserModal.scss';

const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, `Firstname has to be at least 2 characters`)
    .required('Firstname is required'),
  lastName: Yup.string()
    .min(2, `Lastname has to be at least 2 characters`)
    .required('Lastname is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required!'),
});

const AddNewUserModal = ({ state, error, onSave, resetState }) => {
  const [modal, setModal] = useState(false);
  const [errorMessage, setError] = useState('');

  useEffect(() => {
    if (hasSucceeded(state)) {
      setModal(false);
    } else if (hasFailed(state)) {
      resetState();
    }
  }, [state]);

  const onSubmit = async values => {
    onSave(values);
  };
  return (
    <>
      <Button
        type="button"
        size="md"
        className="btn-success btn-brand mr-1 mb-1 float-right"
        onClick={() => setModal(true)}
      >
        <i className="fa fa-plus"></i>
        <span>Add New User</span>
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-md'}>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
          }}
          validationSchema={userSchema}
          onSubmit={onSubmit}
          enableReinitialize={true}
          render={({ isSubmitting, handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit} noValidate name="addLocationForm">
              <ModalHeader>Add New User</ModalHeader>
              <ModalBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="name">First Name</Label>
                      <Field
                        name="firstName"
                        type={'text'}
                        component={FormInput}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="phoneNumber">Last Name</Label>
                      <Field
                        name="lastName"
                        type={'text'}
                        component={FormInput}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for="address1">Email</Label>
                  <Field name="email" type={'text'} component={FormInput} />
                </FormGroup>
                <Col>
                  {hasFailed(state) ? (
                    <h6 className="text-danger">{errorMessage.message}</h6>
                  ) : null}
                </Col>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!isValid || isPending(state)}
                >
                  {isPending(state) ? 'Wait...' : 'Send Verification Link'}
                </Button>
                <Button
                  color="danger"
                  disabled={isPending(state)}
                  onClick={() => setModal(false)}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        />
      </Modal>
    </>
  );
};

export default withRouter(AddNewUserModal);
