import React from 'react';
import { FormFeedback } from 'reactstrap';
import MaskedInput from 'react-text-mask';
import { phoneNumberMask } from '../../../utils/validate';
import PropTypes from 'prop-types';

const FormPhoneInput = ({ field, form: { touched, errors }, ...props }) => (
  <div>
    {/* <Input
            invalid={!!(touched[field.name] && errors[field.name])}
            {...field}
            {...props} />
        {touched[field.name] && errors[field.name] && <FormFeedback>{errors[field.name]}</FormFeedback>} */}

    <MaskedInput
      mask={phoneNumberMask}
      {...props}
      {...field}
      className={
        errors[field.name] && touched[field.name]
          ? 'is-invalid form-control'
          : 'form-control'
      }
    />
    {touched[field.name] && errors[field.name] && (
      <FormFeedback>{errors[field.name]}</FormFeedback>
    )}
  </div>
);

FormPhoneInput.propTypes = {
  meta: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default FormPhoneInput;
