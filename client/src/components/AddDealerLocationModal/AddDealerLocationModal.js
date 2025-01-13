import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
// import { mohawkBrands } from '../../_config/constants';
import FormInput from '../../components/common/FormInput';
import FormPhoneInput from '../../components/common/FormPhoneInput';
import FormSelect from '../../components/common/FormSelect';
import { isPending, hasSucceeded, hasFailed } from '../../utils/state';
import { useMediaQuery } from 'react-responsive';

const us_state = states.US;
const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};

const dealerLocationSchema = Yup.object().shape({
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
  mohawkAccount: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(6, 'Must be exactly 6 digits')
    .max(6, 'Must be exactly 6 digits')
    .required('Mohawk Account is required'),
});

const AddDealerLocationModal = ({ submitHandler }) => {
  const [modal, setModal] = useState(false);

  const adding_dealer_location = useSelector(
    state => state.orderhistory.adding_dealer_location
  );

  const onSubmit = async values => {
    await submitHandler(values);
  };

  useEffect(() => {
    if (hasSucceeded(adding_dealer_location)) {
      setModal(false);
    }
  }, [adding_dealer_location]);

  return (
    <>
      <Button
        type="button"
        size="md"
        className="btn-success btn-brand mr-1 mb-1 float-right"
        onClick={() => setModal(true)}
      >
        <i className="fa fa-plus"></i>
        <Default>
          <span>Add Dealer Location</span>
        </Default>
      </Button>
      <Modal isOpen={modal} className={'modal-primary modal-lg'}>
        <Formik
          initialValues={{
            name: '',
            address1: '',
            address2: '',
            phoneNumber: '',
            // mohawkBrand: 'Mohawk',
            mohawkAccount: '',
            city: '',
            us_state: '',
            zipcode: '',
          }}
          validationSchema={dealerLocationSchema}
          onSubmit={onSubmit}
          enableReinitialize={true}
          render={({ isSubmitting, handleSubmit, isValid }) => (
            <Form onSubmit={handleSubmit} noValidate name="dealerLocationForm">
              <ModalHeader>Add Dealer Location</ModalHeader>
              <ModalBody>
                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="name">Location Name</Label>
                      <Field name="name" type={'text'} component={FormInput} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="mohawkAccount">Mohawk Account #</Label>
                      <Field
                        name="mohawkAccount"
                        type={'text'}
                        component={FormInput}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="phoneNumber">Phone Number</Label>
                      <Field
                        name="phoneNumber"
                        type={'text'}
                        component={FormPhoneInput}
                      />
                    </FormGroup>
                  </Col>
                  {/* <Col md={6}>
                                        <FormGroup>
                                            <Label for="mohawkBrand">
                                                Account type
                                            </Label>
                                            <Field
                                                name="mohawkBrand"
                                                component={FormSelect}
                                                options={mohawkBrands}
                                            />
                                        </FormGroup>
                                    </Col> */}
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
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!isValid || isPending(adding_dealer_location)}
                >
                  {isPending(adding_dealer_location) ? 'Wait...' : 'Submit'}
                </Button>
                <Button
                  color="danger"
                  onClick={() => setModal(false)}
                  disabled={isPending(adding_dealer_location)}
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

export default AddDealerLocationModal;
