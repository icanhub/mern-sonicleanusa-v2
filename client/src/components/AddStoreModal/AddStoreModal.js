import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import states from '../../_config/states';
import FormInput from '../../components/common/FormInput';
import FormPhoneInput from '../../components/common/FormPhoneInput';
import FormSelect from '../../components/common/FormSelect';
import { savestore, putstore } from '../../reducers/Stores';
import { isPending, hasSucceeded, hasFailed } from '../../utils/state';
import { useMediaQuery } from 'react-responsive';

import './AddStoreModal.scss';

const us_state = states.US;
const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};

const storeLocationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, `Store name has to be at least 2 characters`)
    .required('Store name is required'),
  address1: Yup.string().required('Address1 is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\D*(\d\D*){10}$/, 'Must be a valid number'),
  city: Yup.string().required('City is required'),
  zipcode: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(5, 'Must be exactly 5 digits')
    .max(5, 'Must be exactly 5 digits')
    .required('Zip Code is required'),
});

const AddStoreModal = ({
  type = 'ADD',
  initialData,
  id,
  btnSize = 'md',
  color = 'success',
  className = 'mr-1',
}) => {
  const [modal, setModal] = useState(false);
  const [errorMessage, setError] = useState('');

  const dispatch = useDispatch();

  const posting_state = useSelector(state => state.stores.posting_state);

  useEffect(() => {
    if (hasSucceeded(posting_state)) {
      setModal(false);
    } else if (hasFailed(posting_state)) {
      setError('Oops! Please try agian!');
    }
  }, [posting_state]);

  const onSubmit = async values => {
    if (type === 'ADD') {
      await dispatch(savestore(values, id));
    } else {
      await dispatch(putstore(values, initialData._id, id));
    }
  };
  return (
    <>
      {type === 'ADD' ? (
        <Button
          type="button"
          size="md"
          className="btn-success btn-brand mr-1 mb-1 float-right"
          onClick={() => setModal(true)}
        >
          <i className="fa fa-plus"></i>
          <Default>
            <span>Add Store Location</span>
          </Default>
        </Button>
      ) : (
        <Button
          color={color}
          size={btnSize}
          className={className}
          onClick={() => setModal(true)}
        >
          EDIT
        </Button>
      )}
      <Modal isOpen={modal} className={'modal-primary modal-lg'}>
        <Formik
          initialValues={
            initialData
              ? initialData
              : {
                  name: '',
                  address1: '',
                  address2: '',
                  phoneNumber: '',
                  city: '',
                  us_state: '',
                  zipcode: '',
                }
          }
          validationSchema={storeLocationSchema}
          onSubmit={onSubmit}
          enableReinitialize={true}
          render={({ isSubmitting, handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit} noValidate name="addLocationForm">
              <ModalHeader>
                {type === 'ADD' ? 'Add Store' : 'Edit Store'}
              </ModalHeader>
              <ModalBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="name">Store Location Name</Label>
                      <Field name="name" type={'text'} component={FormInput} />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="phoneNumber">Store Phone Number</Label>
                      <Field
                        name="phoneNumber"
                        type={'text'}
                        component={FormPhoneInput}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for="address1">Address 1</Label>
                  <Field name="address1" type={'text'} component={FormInput} />
                </FormGroup>

                <FormGroup>
                  <Label for="address2">Address 2</Label>
                  <Field name="address2" type={'text'} component={FormInput} />
                </FormGroup>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="city">City</Label>
                      <Field name="city" type={'text'} component={FormInput} />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="us_state">State</Label>
                      <Field
                        name="us_state"
                        component={FormSelect}
                        options={us_state}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="zipcode">Zip Code</Label>
                      <Field
                        name="zipcode"
                        type={'text'}
                        component={FormInput}
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    {hasFailed(posting_state) && (
                      <h6 className="text-danger">{errorMessage}</h6>
                    )}
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!isValid || isPending(posting_state)}
                >
                  {isPending(posting_state) ? 'Wait...' : 'Submit'}
                </Button>
                <Button
                  color="danger"
                  onClick={() => setModal(false)}
                  disabled={isPending(posting_state)}
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

export default withRouter(AddStoreModal);
