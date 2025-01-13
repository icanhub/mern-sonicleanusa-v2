import React from 'react';
import { FormFeedback, Input } from 'reactstrap';
import PropTypes from 'prop-types';

const FormInput = ({ field, form: { touched, errors }, ...props }) => (
  <div>
    <Input
      invalid={!!(touched[field.name] && errors[field.name])}
      {...field}
      {...props}
    />
    {touched[field.name] && errors[field.name] && (
      <FormFeedback>{errors[field.name]}</FormFeedback>
    )}
  </div>
);

FormInput.propTypes = {
  meta: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default FormInput;
