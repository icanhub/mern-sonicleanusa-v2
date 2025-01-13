import React from 'react';
import {
  Button,
  FormGroup,
  Input,
  FormFeedback,
  Col,
  InputGroup,
  InputGroupAddon,
  Label,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { onSetDiscount } from '../../../../reducers/salesForm';
import { notification } from '../../../../utils/notification';

import { Formik } from 'formik';
import 'react-toastify/dist/ReactToastify.css';
import './Discount.scss';

const Discount = ({ totalPrice }) => {
  const discount = useSelector(state => state.salesform.discount);

  const dispatch = useDispatch();

  const success = values => {
    if (values.discount > totalPrice) {
      notification(
        'Warning',
        'Discount Price must less than total Price.',
        'warning'
      );
    } else {
      dispatch(onSetDiscount(values.discount));
    }
  };

  return (
    <div className="Discount">
      <Formik
        initialValues={{ discount: discount }}
        onSubmit={(values, actions) => {
          success(values);
          setTimeout(() => {
            actions.setSubmitting(false);
          }, 1000);
        }}
        // validationSchema={validationSchema}
      >
        {formikProps => (
          <FormGroup row>
            <Col md="12" className="text-left">
              <Label>Discount Price</Label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <Button
                    type="submit"
                    onClick={formikProps.handleSubmit}
                    color="primary"
                  >
                    Apply
                  </Button>
                </InputGroupAddon>
                <Input
                  type="number"
                  name="discount"
                  id="discount"
                  placeholder="Discount Price"
                  valide={!formikProps.errors.discount}
                  invalid={
                    formikProps.touched.discount &&
                    !!formikProps.errors.discount
                  }
                  autoFocus={true}
                  required
                  onChange={formikProps.handleChange}
                  onBlur={formikProps.handleBlur}
                  value={formikProps.discount}
                />
                <FormFeedback>{formikProps.errors.discount}</FormFeedback>
              </InputGroup>
            </Col>
          </FormGroup>
        )}
      </Formik>
    </div>
  );
};

export default Discount;
